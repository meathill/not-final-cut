const _config = {};

module.exports = {
  get() {
    return _config;
  },
  set(value) {
    Object.assign(_config, value);
  },
}
