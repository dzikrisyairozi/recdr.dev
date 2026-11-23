---
title: 'Export part of a recording'
description: "recdr export writes a GIF or MP4 of a finished recording, trimmed and cropped, without touching the recording's own files."
sidebar:
  order: 2
---

`recdr export` writes a GIF or MP4 of a finished recording, trimmed and cropped, without touching the recording's own files:

```
recdr export 20261118-143502-1a2b --file cut.gif --from 2s --until 5s --crop 0,0,640,360
```

| Flag             | Meaning                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `--file <path>`  | Required. `.gif` or `.mp4`; the extension picks the format. An existing file is replaced only when the export succeeds. |
| `--from <time>`  | Start of the kept part. Default: the start.                                                                             |
| `--until <time>` | End of the kept part. Default: the end.                                                                                 |
| `--crop x,y,w,h` | A rectangle in the recording's pixels, at least 2 by 2, inside the picture.                                             |

It prints `{"path", "width", "height", "duration_ms", "frames"}`; for an MP4 the size is that of the pictures in the file, after the padding described under Build. Click rings are drawn when the recording kept clicks. A recording that is still running is `recording_not_found`; bad times, a crop outside the picture or another extension are `usage`; a file that cannot be written is `encode_failed`.
