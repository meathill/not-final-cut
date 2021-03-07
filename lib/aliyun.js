const Client = require('@alicloud/nls-filetrans-2018-08-17');
const OSS = require('ali-oss');
const config = require('./config');
const {md5} = require("./util");
const {sleep} = require("./util");
const ENDPOINT = 'http://filetrans.cn-shanghai.aliyuncs.com';
const API_VERSION = '2018-08-17';

async function stt(wav) {
  const {
    aliyunId,
    aliyunSecret,
    aliyunAppKey,
    aliyunRegion,
    aliyunOss,
    urlPrefix,
  } = config.get();

  // upload wav file
  const oss = new OSS({
    bucket: aliyunOss,
    region: aliyunRegion,
    accessKeyId: aliyunId,
    accessKeySecret: aliyunSecret,
  });

  const onProgress = (p) => {
    console.log(`[NFC]     ${Math.round(p * 10000) / 100}%`);
  }

  console.log('[NFC]   uploading wav...');
  const filename = md5(wav) + '.wav';
  let result = await oss.multipartUpload(filename, wav, {
    progress: onProgress,
  });
  console.log('[NFC]   wav uploaded');

  // do stt
  const client = new Client({
    accessKeyId: aliyunId,
    secretAccessKey: aliyunSecret,
    endpoint: ENDPOINT,
    apiVersion: API_VERSION
  });

  /**
   * 提交录音文件识别请求，请求参数组合成JSON格式的字符串作为task的值。
   * 请求参数appkey：项目appkey。
   * 请求参数file_link：需要识别的录音文件。
   */
  let task = {
    appkey : aliyunAppKey,
    file_link : urlPrefix + filename,
    version : "4.0",
    enable_words : true,
  };
  task = JSON.stringify(task);
  const taskParams = {
    Task : task
  };
  const options = {
    method: 'POST'
  };
  // 提交录音文件识别请求，处理服务端返回的响应。
  console.log('[NFC]   converting...');
  const response = await client.submitTask(taskParams, options);
  // 服务端响应信息的状态描述StatusText。
  const statusText = response.StatusText;
  if (statusText !== 'SUCCESS') {
    throw new Error('[NFC]   提交录音识别请求失败');
  }

  console.log('[NFC]   开始识别');
  // 获取录音文件识别请求任务的TaskId，以供识别结果查询使用。
  const {TaskId} = response;
  /**
   * 以TaskId为查询参数，提交识别结果查询请求。
   * 以轮询的方式进行识别结果的查询，直到服务端返回的状态描述为"SUCCESS"、SUCCESS_WITH_NO_VALID_FRAGMENT，
   * 或者为错误描述，则结束轮询。
   */
  const taskIdParams = {
    TaskId,
  };
  result = await Promise.race([
    sleep(6E5), // max wait 1m
    new Promise((resolve, reject) => {
      const timer = setInterval(async () => {
        const response = await client.getTaskResult(taskIdParams);
        const statusText = response.StatusText;
        if (statusText === 'RUNNING' || statusText === 'QUEUEING') {
          // 继续轮询，注意间隔周期。
          console.log('[NFC]     converting...');
          return;
        }

        if (statusText === 'SUCCESS' || statusText === 'SUCCESS_WITH_NO_VALID_FRAGMENT') {
          console.log('[NFC]   录音文件识别成功：');
          resolve(response.Result)
        } else {
          console.log('[NFC]   录音文件识别失败!');
          reject();
        }
        // 退出轮询
        clearInterval(timer);
      }, 10000);
    }),
  ]);
  if (!result) {
    throw new Error('[NFC] 识别失败');
  }

  return result;
}

module.exports = stt;
