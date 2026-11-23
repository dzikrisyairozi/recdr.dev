# The demo recording

`src/assets/demo/` holds one recdr recording of `demo/index.html`, a small
checkout page. The landing page shows its frames, contact sheet, GIF, MP4 and
JSON files as recdr wrote them. Nothing in that folder is edited by hand.

In the six seconds of the recording the script clicks `Buy` once. The button
reads `Processing…` while a bar fills for 600 ms, then a toast
`Payment accepted` comes in, stays for 1.5 seconds and leaves.

## Record it again

You need:

- recdr 0.1.0 or later, on `PATH` or with its path in `RECDR_BIN`
- Playwright's Chromium: `pnpm exec playwright install chromium`

From the repository root:

```bash
node demo/record.ts
```

The script starts Chromium with remote debugging on port 9222, opens the
page at 960 by 600 and runs:

```bash
recdr record --cdp 9222 --tab checkout --duration 6s --fps 15 --format gif,mp4
```

It waits until recdr listens for clicks, clicks `Buy` 1.5 seconds later, and
when recdr exits copies the recording from `./.recdr` into `src/assets/demo/`.
It stops with an error when the recording has no click, or when `result.json`
holds a path with your user name in it (the landing page shows that file, so
keep the repository outside your home folder when you record).

Frame count and timings differ a little between runs. Run `pnpm test` and
`pnpm test:e2e` after recording again.

## The committed recording

| Field         | Value                                             |
| ------------- | ------------------------------------------------- |
| recdr release | `v0.1.0`, commit `aa47cd8`                        |
| Release asset | `recdr-x86_64-pc-windows-msvc.zip`                |
| Recorded on   | 2026-11-23, Windows 11                            |
| Frames stored | 19                                                |
| Click         | 1551 ms, at 480, 282 in frame pixels, left button |
