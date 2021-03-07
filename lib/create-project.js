const {
  existsSync,
  promises: {

  },
} = require('fs');
const {
  resolve,
} = require('path');
const exec = promisify(require('child_process').exec);
const {promisify} = require('util');
const md5File = require('md5-file');
const {getProjectFile} = require("./util");

async function createProjectFromVideo(video) {
  const projectFile = getProjectFile(video);
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

  // stt
  console.log('[NFC] converting speech to text...');

  // build project
  console.log('[NFC] building project...');

  // finish, return project
  return {
    project,
    projectFile,
  };
}

module.exports = createProjectFromVideo;
