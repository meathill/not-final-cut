const {
  basename,
  dirname,
  extname,
  resolve,
} = require('path');
const {createHash} = require('crypto');

function getProjectFile(file) {
  file = resolve(process.cwd(), file);
  const baseDir = dirname(file);
  const ext = extname(file);
  const filename = basename(file, ext);
  return `${baseDir}/${filename}.nfc.json`;
}

function sleep(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

function md5(str) {
  return  createHash('md5').update(str).digest("hex");
}

module.exports = {
  getProjectFile,
  md5,
  sleep,
};
