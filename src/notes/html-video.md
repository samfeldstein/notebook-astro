---
title: HTML Video
tags:
  - web-development
created: 2024-12-03
updated: 2024-12-04
---
## Compression

### Tools

- [Handbrake](https://handbrake.fr)
- [FFmpeg](https://www.ffmpeg.org)

### Reading

- [Video Playback on the Web](https://www.smashingmagazine.com/2018/10/video-playback-on-the-web-part-2/)

## Thumbnails

For some reason, mobile browsers don't display the first frame as a thumbnail. At least that's been my experience.

The solution is pretty simple. Take a screenshot of the first frame and set it as the thumbnail manually.

I have a mac, so I used `shiftCmd5` to take the screenshot. I [Squooshed](https://squoosh.app) the image, then set it as the thumbnail. To do that, you use the `video` element's `poster` attribute.

```html
<video controls="controls" poster="/thumbnail.jpg">
<source src="/video.mp4" type="video/mp4" />
</video>
```