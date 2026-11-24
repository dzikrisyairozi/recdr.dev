# The demo recording

`src/assets/demo/` holds one recdr recording of `demo/index.html`, the
checkout page of a shop called keyboards.example. The landing page shows its
frames, contact sheet, GIF, MP4 and JSON files as recdr wrote them. Nothing in
that folder is edited by hand.

## What the page does

The script clicks `Buy` once. The button reads `Processing…` while a bar
fills for 600 ms. Then a red banner, `Payment failed`, slides in over 100 ms,
stays for 250 ms and slides out over 100 ms. The order summary is replaced
by `Order confirmed` with a check mark, and the page stays that way.

A screenshot taken after the click shows a confirmed order. Only the frames
in between show that a payment failed first, and that is the story the
landing page tells with this recording.

## Record it again

You need:

- recdr 0.1.1 or later, on `PATH` or with its path in `RECDR_BIN`
- Playwright's Chromium: `pnpm exec playwright install chromium`
- the repository in a folder whose path does not hold your user name. The
  landing page shows `result.json`, and that file holds absolute paths

From the repository root:

```bash
node demo/record.ts
```

The script starts Chromium with remote debugging on port 9222, opens the
page at 1280 by 800 and runs the commands an agent would run:

```bash
recdr tabs --cdp 9222
recdr start --cdp 9222 --tab-id <id of the Checkout tab> --fps 15 --format gif,mp4
recdr mark <recording id> "clicked Buy"
recdr stop <recording id>
```

After `start` it waits until recdr listens for clicks, waits another 1.5
seconds and clicks `Buy`. The mark follows the click. It stops the recording
2 seconds after the page reports the confirmed order.

Then it checks the recording and stops with an error when one of these does
not hold:

- `result.json` has no path with your user name in it
- there is one click and one mark
- at most 60 frames are stored, because the hero downloads every one of them
- at most 12 are keyframes, so the contact sheet shows all of them
- the recording is 4.5 to 8.5 seconds long
- a stored frame shows the whole banner, and a later frame no longer shows it
- one of the frames with the banner is a keyframe

The script finds the banner by counting red pixels in the stored frames. The
page's own clock and recdr's frame times differ by 20 to 70 ms, which is too
much for a banner that is whole for 250 ms.

When every check passes it copies the recording from `./.recdr` into
`src/assets/demo/` and writes `demo/story.json`: the tab's title and id, and
the labels of the first frame with the banner, the frame with the most of it,
and the first frame after it. The landing page takes its timings and the
agent's finding from that file, `manifest.json` and `result.json`, so no
component has a frame number typed into it.

Frame count and timings differ a little between runs. After recording again:

- open `src/assets/demo/contact_sheet.png` and confirm that one tile shows
  the `Payment failed` banner
- run `pnpm check-all` and `pnpm test:e2e`
- retake `docs/images/home.png` if the hero looks different
- update the table below

## The committed recording

| Field           | Value                                                                                |
| --------------- | ------------------------------------------------------------------------------------ |
| recdr release   | `v0.1.1`, commit `7412cee`                                                           |
| Release asset   | `recdr-x86_64-pc-windows-msvc.zip`                                                   |
| Recorded on     | 2026-11-23 (UTC), Windows 11                                                         |
| Recording id    | `20261123-202425-a615`                                                               |
| Size and length | 1280 by 800, 15 fps, 5654 ms                                                         |
| Frames stored   | 23                                                                                   |
| Keyframes       | 9                                                                                    |
| Click           | 1823 ms, at 964, 435 in frame pixels, left button                                    |
| Mark            | 1867 ms, `clicked Buy`                                                               |
| Banner          | first in frame 000010 (2550 ms), whole in 000013 (2839 ms), gone by 000016 (3035 ms) |
| `recording.gif` | 1.1 MB. recdr has no option to scale the GIF; the landing page loads it lazily       |
