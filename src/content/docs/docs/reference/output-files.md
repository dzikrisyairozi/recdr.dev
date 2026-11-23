---
title: 'What a recording leaves'
description: 'The files recdr writes for each recording: the frames as PNG, manifest.json, diff.json, contact_sheet.png, the GIF or MP4, and result.json.'
sidebar:
  order: 2
---

A recording lives in `<out>/<id>/`:

| File                             | Contents                                                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `frames/000001.png`, ...         | Each frame that differs from the one before it.                                                        |
| `manifest.json`                  | Size, fps, duration, each frame's time, marks, clicks, stop reason, dropped frames.                    |
| `diff.json`                      | For each frame: the share of pixels that changed, the box around them, and whether it is a keyframe.   |
| `contact_sheet.png`              | Up to 12 keyframes in a grid, each labelled with its time and any marks. At most 2000 px on each edge. |
| `recording.gif`, `recording.mp4` | The formats asked for, with a ring drawn for 400 ms after each click.                                  |
| `result.json`                    | What `stop` and `record` print.                                                                        |

`recdr` writes `<out>/.gitignore` containing `*`, so recordings are not committed by accident.
