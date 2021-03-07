const {
  existsSync,
  promises: {
    writeFile,
  },
} = require('fs');
const {
  resolve,
} = require('path');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const md5File = require('md5-file');
const stt = require("./aliyun");
const {getProjectFile} = require("./util");
const config = require('./config');

async function createProjectFromVideo(video) {
  const projectFile = getProjectFile(video);
  config.set(projectFile);
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
  console.log('[NFC] extracting audio from video...');
  const {ffmpeg} = config.get();
  const mp3 = video.substring(0, video.lastIndexOf('.')) + 'mp3';
  const cmd = `${ffmpeg} -i ${video} -q:a 0 -map a ${mp3}`;
  const {stdout, stderr} = await exec(cmd);
  console.log(stdout);
  console.log(stderr);
  if (!existsSync(mp3)) {
    throw new Error('Extract mp3 filed.');
  }

  // stt
  console.log('[NFC] converting speech to text...');
  const textResult = stt(mp3);

  // build project
  console.log('[NFC] building project...');
  project = {
    hash: fileHash,
    createdAt: new Date().toLocaleString(),
    rawResult: textResult,
  }
  await writeFile(projectFile, JSON.stringify(project), 'utf8');

  // finish, return project
  return {
    project,
    projectFile,
  };
}

module.exports = createProjectFromVideo;
