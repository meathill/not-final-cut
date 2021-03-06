function toHMS(ms) {
  let s = ms / 1000 >> 0;
  ms = ms % 1000;
  const result = [];
  let index = 0;
  while (s > 0 && index < 3) {
    const time = s % 60;
    s = s / 60 >> 0;
    index += 1;
    result.push(time);
  }
  if (result.length === 0) {
    result.push(0);
  }
  return result.reverse().join(':') + '.' + ms;
}

module.exports = {
  toHMS,
};
