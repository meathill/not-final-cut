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
  res.send('=== [NFC] 开始解析配置文件');
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

  res.send('=== [NFC] 解析完毕，开始生成视频剪辑...');
  let resolve;
  let reject;
  if (!existsSync(tempDir)) {
    await mkdir(tempDir, {recursive: true});
  }
  let p = spawn(ffmpeg, [
    '-y',
    '-i',
    '-c',
    'copy',
    '-avoid_negative_ts',
    '1',
    input,
  ]);
  pieces.push(...pieces.map(([start, end], index) => {
    p.push(...['-ss', toHMS(start), '--to', toHMS(end), `a${index}.mp4`]);
  }));
  p.stdout.on('data', res.send);
  p.stderr.on('data', res);
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
    res.send('=== [NFC] 生成视频剪辑失败。[code]' + e + '[/code]');
    res.end();
    return;
  }

  res.send('=== [NFC] 视频剪辑已生成。开始合成视频...');
  const txt = pieces.map((item, index) => `file a${index}.mp4`).join('\n');
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
  p.stdout.on('data', res.send);
  p.stderr.on('data', res.send);
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
    res.send('=== [NFC] 生成视频剪辑失败。[code]' + e + '[/code]');
    res.end();
    return;
  }

  res.send('=== [NFC] 完整视频已生成。');
  res.send('=== [NFC] [movie]' + output + '[/movie]');
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
