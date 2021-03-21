#!/usr/bin/env node

const os = require('os');
const {dirname} = require('path');
const yargs = require('yargs');
const createProjectFromVideo = require("./lib/create-project");
const createServer = require('./lib/server');
const config = require('./lib/config');

const {argv} = yargs.scriptName('nfc')
  .usage('$0 -i input.video [args]')
  .env('NFC')
  .option('input', {
    alias: 'i',
    nargs: 1,
    describe: 'the video you want to cut',
    demandOption: 'Please provide the video you want to cut',
  })
  .option('output', {
    alias: 'o',
    nargs: 1,
    describe: 'edited video to output',
  })
  .option('aliyun-id', {
    describe: 'Your Aliyun RAM account AccessKey ID',
    type: 'string'
  })
  .option('aliyun-secret', {
    describe: 'Your Aliyun RAM account AccessKey Secret',
    type: 'string',
  })
  .option('aliyun-app-key', {
    describe: 'Your Aliyun NLS project app key',
    type: 'string',
  })
  .option('aliyun-oss', {
    describe: 'OSS bucket to store audio file',
    type: 'string',
  })
  .option('aliyun-region', {
    describe: 'Your Aliyun region',
    type: 'string',
  })
  .option('url-prefix', {
    describe: 'URL prefix to find your uploaded wav file',
    type: 'string',
  })
  .option('ffmpeg', {
    describe: 'The path to FFMPEG',
    default: 'ffmpeg',
    type: 'string',
  })
  .option('p',{
    alias: 'port',
    describe: 'port of local API server',
    default: 8888,
    nargs: 1,
  })
  .help('help')
  .alias('h', 'help')
  .help();

config.set(argv);

(async () => {
  console.log('[NFC] starting...');
  let {input} = argv;
  if (/^~\//.test(input)) {
    input = input.replace(/^~/, os.homedir);
  }
  const cwd = dirname(input);
  config.set({input, cwd});
  const project = await createProjectFromVideo(input);
  await createServer(project);
  console.log('[NFC] Not Final Cut started. Please enjoy.');
})();
