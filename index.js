#!/usr/bin/env node

const yargs = require('yargs');
const createProjectFromVideo = require("./lib/create-project");
const createServer = require('./lib/server');

const {argv} = yargs.scriptName('nfc')
  .usage('$0 -i input.video [args]')
  .alias('i', 'input')
    .nargs('i', 1)
    .describe('i', 'the video you want to cut')
  .env('NFC_ALIYUN_ID')
    .option('aliyun-id', {
      describe: 'Your Aliyun App ID',
      demandOption: true,
      type: 'string'
    })
  .env('NFC_ALIYUN_KEY')
    .option('aliyun-key', {
      describe: 'Your Aliyun App SecretKey',
      demandOption: true,
      type: 'string',
    })
  .env('NFC_FFMPEG_PATH')
    .option('ffmpeg', {
      describe: 'The path to FFMPEG',
      demandOption: true,
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

(async () => {
  console.log('[NFC] starting...');
  const {input, aliyunId, aliyunKey, port} = argv;
  const {project, projectFile} = await createProjectFromVideo(input, aliyunId, aliyunKey);
  const server = await createServer(port, project, projectFile);

  console.log('[NFC] Not Final Cut started. Please enjoy.');
})();
