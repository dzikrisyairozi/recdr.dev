---
title: 'Stop reasons'
description: 'stop_reason in the result is one of: stopped, duration_reached, cap_reached, size_cap_reached, command_exited, window_closed and tab_closed.'
sidebar:
  order: 3
---

`stop_reason` in the result is one of: `stopped` (`recdr stop`), `duration_reached` (`--duration`), `cap_reached` (`--max-duration`), `size_cap_reached` (`--max-size`), `command_exited` (the wrapped command ended; `command_exit_code` holds its code), `window_closed` (the recorded window closed) and `tab_closed` (the recorded tab closed or the browser went away).
