#!/usr/bin/env node

const yargs = require('yargs');
const createProjectFromVideo = require("./lib/create-project");
const createServer = require('./lib/server');
const config = require('./lib/config');

const {argv} = yargs.scriptName('nfc')
  .usage('$0 -i input.video [args]')
  .alias('i', 'input')
    .nargs('i', 1)
    .describe('i', 'the video you want to cut')
  .env('NFC_ALIYUN_ID')
    .option('aliyun-id', {
      describe: 'Your Aliyun RAM account AccessKey ID',
      demandOption: true,
      type: 'string'
    })
  .env('NFC_ALIYUN_SECRET')
    .option('aliyun-secret', {
      describe: 'Your Aliyun RAM account AccessKey Secret',
      demandOption: true,
      type: 'string',
    })
  .env('NFC_ALIYUN_APP_KEY')
    .option('aliyun-app-key', {
      describe: 'Your Aliyun NLS project app key',
      demandOption: true,
      type: 'string',
    })
  .env('NFC_ALIYUN_OSS')
    .option('aliyun-oss', {
      describe: 'OSS bucket to store audio file',
      demandOption: true,
      type: 'string',
    })
  .env('NFC_ALIYUN_REGION')
    .option('aliyun-region', {
      describe: 'Your Aliyun region',
      demandOption: true,
      type: 'string',
    })
  .env('NFC_URL_PREFIX')
    .option('url-prefix', {
      describe: 'URL prefix to find your uploaded wav file',
      demandOption: true,
      type: 'string',
    })
  .env('NFC_FFMPEG_PATH')
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
  .demandOption('input', 'Please provide the video you want to cut')
  .help();

config.set(argv);

(async () => {
  console.log('[NFC] starting...');
  const {input} = argv;
  const project = await createProjectFromVideo(input);
  const server = await createServer(project, config);

  console.log('[NFC] Not Final Cut started. Please enjoy.');
})();
