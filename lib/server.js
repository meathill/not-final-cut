const {
  promises: {
    writeFile,
    mkdir,
  },
  existsSync,
} = require('fs');
const {spawn} = require('child_process');
const express = require('express');
const app = new express();
const config = require('./config');
const {toHMS} = require('../src/utils/format');

let _projectFile;
let _project;

app.use(express.json({limit: '10mb'}));
app.use('/', express.static('dist'));

app.get('/api/project.json', (req, res) => {
  res.json(_project);
});
app.post('/api/save', async(req, res) => {
  let project = req.body;
  _project = project;
  project = JSON.stringify(project);
  if (project.length < 100) {
    return res.error({
      code: 1,
      message: '内容太少，可能有误',
    });
  }
  await writeFile(_projectFile, project, 'utf8');
  return res.json({
    code: 0,
    data: 'ok',
  });
});
app.post('/api/export', async (req, res) => {
  res.set('Content-Type', 'application/octet-stream');
  res.write('=== [NFC] 开始解析配置文件\n');
  const {rawResult: {Sentences}} = _project;
  const {pieces} = Sentences.reduce(({pieces, lastTime, keptLastWord}, item) => {
    const {words, BeginTime: bt, EndTime: et} = item;
    // no speech
    if (lastTime < bt) {
      if (keptLastWord) {
        pieces[pieces.length - 1][1] = bt;
      } else {
        pieces.push([lastTime, bt]);
      }
    }

    // words
    let count = 0;
    const current = words.reduce((memo, word, index) => {
      const {BeginTime, EndTime, off} = word;
      if (off) {
        return memo;
      }

      count += 1;
      const last = memo[memo.length - 1];
      if (last && last[1] === BeginTime) {
        last[1] = EndTime;
      } else {
        memo.push([BeginTime, EndTime]);
      }
      keptLastWord = index === words.length - 1;
      return memo;
    }, []);
    if (count === words.length) {
      pieces[pieces.length - 1][1] = et;
    } else if (current.length > 0) {
      // first word is kept
      if (current[0][0] === bt && pieces[pieces.length - 1][1] === bt) {
        pieces[pieces.length - 1][1] = current[0][1];
        current.shift();
      }
      pieces.push(...current);
    }
    return {
      pieces,
      lastTime: et,
      keptLastWord,
    };
  }, {
    pieces: [],
    lastTime: 0,
    keptLastWord: false,
  });
  const {
    input,
    output,
    ffmpeg,
    tempDir,
  } = config.get();

  res.write('=== [NFC] 解析完毕，开始生成视频剪辑...\n');
  let resolve;
  let reject;
  if (!existsSync(tempDir)) {
    await mkdir(tempDir, {recursive: true});
  }
  let ffmpegArgs = [
    '-y',
    '-i',
    input,
    '-c',
    'copy',
    '-avoid_negative_ts',
    '1',
  ];
  pieces.forEach(([start, end], index) => {
    ffmpegArgs.push('-ss', toHMS(start), '-to', toHMS(end), `${tempDir}/a${index}.mp4`);
  });
  let p = spawn(ffmpeg, ffmpegArgs);
  p.stdout.on('data', data => {
    res.write(data.toString());
  });
  p.stderr.on('data', data => {
    res.write(data.toString());
  });
  p.on('close', code => {
    if (code) {
      reject(code);
    } else {
      resolve();
    }
  });
  try {
    await new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
  } catch (e) {
    res.write('=== [NFC] 生成视频剪辑失败。[code]' + e + '[/code]\n');
    res.end();
    return;
  }

  res.write('=== [NFC] 视频剪辑已生成。开始合成视频...');
  const txt = pieces.map((item, index) => `file ${tempDir}/a${index}.mp4`).join('\n');
  const listFile = `${tempDir}/files.txt`;
  await writeFile(listFile, txt, 'utf8');
  p = spawn(ffmpeg, [
    '-y',
    '-f',
    'concat',
    '-i',
    listFile,
    '-c',
    'copy',
    output,
  ]);
  p.stdout.on('data', data => {
    res.write(data.toString());
  });
  p.stderr.on('data', data => {
    res.write(data.toString());
  });
  p.on('close', code => {
    if (code) {
      reject(code);
    } else {
      resolve();
    }
  });
  try {
    await new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
  } catch (e) {
    res.write('=== [NFC] 生成视频剪辑失败。[code]' + e + '[/code]\n');
    res.end();
    return;
  }

  res.write('=== [NFC] 完整视频已生成。\n');
  res.write('=== [NFC] [movie]' + output + '[/movie]\n');
  res.end();
});


function createServer(project) {
  const {
    port,
    projectFile,
    cwd,
  } = config.get();
  _projectFile = projectFile;
  _project = project;
  app.use('/source', express.static(cwd));
  app.listen(port, () => {
    console.log(`Not Final Cut are running at http://localhost:${port}`);
  });
}

module.exports = createServer;
