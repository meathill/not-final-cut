Not Final Cut
=============

A video cutter built on purpose from https://blog.meathill.com/tools/idea-better-video-clipper.html


Prerequisites
------------

### FFMPEG

Only tested FFMPEG>=4.3.1.

### Node.js

Need at least Node.js 14.15


Synopsis
------------

```bash
# first, install not-final-cut globally
npm i not-final-cut -g

# setup your aliyun account
export NFC_ALIYUN_ID=xxxxxxxx
export NFC_ALIYUN_SECRET=oooooooo
export NFC_ALIYUN_APP_KEY=xoxoxoxo
export NFC_ALIYUN_OSS=bucket
export NFC_ALIYUN_REGION=cn-hangzhou
export NFC_ALIYUN_DOMAIN=http://your-domain.com
export NFC_FFMPEG_PATH=/path/to/ffmpeg

# start not-final-cut
nfc -i input.mp4

# your browser will open, and you can continue you job from browser
```


Usage
-----

```bash
-h                Print this help.
-i                Specify the input video.
--aliyun-id       Specify your Aliyun RAM AccessKey ID
--aliyun-secret   Specify your Aliyun RAM AccessKey Secret key
--aliyun-app-key  Specify your Aliyun NLS project app key
--aliyun-oss      Specify your Aliyun OSS bucket
--aliyun-region   Specify your Aliyun region
--url-prefix      Specify URL prefix to find your uploaded wav file
--ffmpeg          Specify the path to FFMPEG
```


Environment
-----------

You can specify system parameters not only through the command line,
but also through environment variables.

### NFC_ALIYUN_ID

Aliyun App ID

### NFC_ALIYUN_KEY

Aliyun App Secret key

### NFC_FFMPEG_PATH

The path to FFMPEG
