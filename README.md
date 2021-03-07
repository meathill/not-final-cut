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
export NFC_ALIYUN_KEY=oooooooo
export NFC_FFMPEG_PATH=/path/to/ffmpeg

# start not-final-cut
nfc -i input.mp4

# your browser will open, and you can continue you job from browser
```


Usage
-----

```bash
-h              Print this help.
-i              Specify the input video.
--aliyun-id     Specify your Aliyun App ID
--aliyun-key    Specify your Aliyun App Secret key
--ffmpeg        Specify the path to FFMPEG

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
