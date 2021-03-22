const {dirname, basename, extname} = require('path');
const {getProjectFile} = require("./util");
const _config = {};

module.exports = {
  get(key) {
    if (key) {
      return _config[key];
    }
    return _config;
  },
  set(value) {
    let {input, output} = value;
    if (input) {
      value.projectFile = getProjectFile(input);
      if (!output) {
        const dir = dirname(input);
        const ext = extname(input);
        const filename = basename(input, ext);
        output = `${dir}/${filename}.output${ext}`;
      }
      value.tempDir = output.substring(0, output.length - extname(output).length) + '.tmp';
      value.output = output;
    }
    Object.assign(_config, value);
  },
};
