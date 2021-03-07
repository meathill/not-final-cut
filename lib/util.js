const {
  basename,
  dirname,
  extname,
  resolve,
} = require('path');

function getProjectFile(file) {
  file = resolve(process.cwd(), file);
  const baseDir = dirname(file);
  const ext = extname(file);
  const filename = basename(file, ext);
  return `${baseDir}/${filename}.nfc.json`;
}

module.exports = {
  getProjectFile,
};
