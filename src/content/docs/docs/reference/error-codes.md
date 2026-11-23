---
title: 'Error codes'
description: 'The error codes recdr prints, and what each one means.'
sidebar:
  order: 4
---

The `code` values in the error a failed command prints, and what each one means.

| Code                    | Meaning                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `usage`                 | Bad flags or arguments. Exit code 2.                                                                                         |
| `target_not_found`      | No window, monitor or tab matches.                                                                                           |
| `ambiguous_target`      | More than one matches; `candidates` lists them.                                                                              |
| `target_minimized`      | The window is minimized and has nothing to capture.                                                                          |
| `region_out_of_bounds`  | `--region` is not inside one monitor.                                                                                        |
| `ffmpeg_not_found`      | `--format mp4` on Linux without `ffmpeg` on `PATH`.                                                                          |
| `recorder_start_failed` | The background recorder exited without saying why, or did not report its first frame in time.                                |
| `recording_not_found`   | No recording with that id under the output root.                                                                             |
| `recording_not_active`  | `stop` or `mark` on a recording that has ended.                                                                              |
| `recorder_crashed`      | The background recorder exited without finishing.                                                                            |
| `too_many_frames`       | `get_frames` would return more than 8 frames.                                                                                |
| `capture_failed`        | The capture source failed.                                                                                                   |
| `encode_failed`         | Writing the GIF or MP4 failed, or, before recording, the system has no H.264 encoder that works.                             |
| `unsupported_platform`  | `windows`, `monitors` or a desktop target on Linux.                                                                          |
| `permission_denied`     | macOS has not given the program that started recdr the Screen Recording permission.                                          |
| `cdp_connect_failed`    | The browser cannot be reached, does not speak CDP, or did not answer within 30 seconds.                                      |
| `managed_install`       | `recdr update` on a copy that Homebrew or cargo installed; the message names the command to run.                             |
| `update_failed`         | `recdr update` could not read the latest version, download the install script, or the script failed; the message says which. |
| `io_error`              | A file or process operation failed.                                                                                          |
