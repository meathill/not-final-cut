const {
  existsSync,
  promises: {
    writeFile,
  },
} = require('fs');
const {
  basename,
  resolve,
} = require('path');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const md5File = require('md5-file');
const stt = require('./aliyun');
const {getProjectFile} = require('./util');
const config = require('./config');

async function createProjectFromVideo(video) {
  const projectFile = getProjectFile(video);
  config.set({projectFile});
  video = resolve(process.cwd(), video);
  const fileHash = await md5File(video);
  let project;
  // video file has not been modified
  if (existsSync(projectFile)) {
    project = require(projectFile);
    const {hash} = project;
    if (hash === fileHash) {
      console.log('[NFC] video file not changed, use current project.');
      return project;
    }
  }

  // extract audio from video
  console.log('[NFC] extracting audio(wav) from video...');
  const {ffmpeg} = config.get();
  const wav = video.substring(0, video.lastIndexOf('.')) + '.wav';
  const cmd = `${ffmpeg} -i ${video} -q:a 0 -map a -acodec pcm_s16le -ar 16000 -y ${wav}`;
  const {stdout, stderr} = await exec(cmd);
  console.log(stdout);
  console.log(stderr);
  if (!existsSync(wav)) {
    throw new Error('Extract wav filed.');
  }

  // stt
  console.log('[NFC] converting speech to text...');
  const textResult = await stt(wav);

  // build project
  console.log('[NFC] building project...');
  const now = new Date().toLocaleString();
  project = {
    movie: basename(video),
    hash: fileHash,
    createdAt: now,
    updatedAt: now,
    rawResult: textResult,
  };
  await writeFile(projectFile, JSON.stringify(project), 'utf8');

  // finish, return project
  return project;
}

module.exports = createProjectFromVideo;
