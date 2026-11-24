// The one real recdr recording the landing page shows. See demo/RECORDING.md.
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import contactSheet from '../assets/demo/contact_sheet.png';
import diff from '../assets/demo/diff.json';
import manifest from '../assets/demo/manifest.json';
import gif from '../assets/demo/recording.gif';
import mp4Url from '../assets/demo/recording.mp4?url';
import result from '../assets/demo/result.json';
import story from '../../demo/story.json';
import { barHeight, buildFrames, clickPoint } from './frames.ts';
import type { Timing } from './hero-scene.ts';
import { bannerFrames, markFrame, session } from './story.ts';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/demo/frames/*.png',
  { eager: true },
);

const firstClick = clickPoint(manifest);
if (!firstClick) throw new Error('the recording has no click');
const click = firstClick;

// What an agent does to make this recording, and what it finds in it.
// session() throws when the recording has no mark.
const steps = session(manifest, story, result);
const mark = manifest.marks[0]!;
const markIndex = markFrame(manifest, mark);
const banner = bannerFrames(manifest, story);

const largestChange = Math.max(
  ...diff.frames.map((frame) => frame.changed_fraction),
);

/** Every frame with its image and what the demo and the #frames inspector show for it. */
const strip = await Promise.all(
  buildFrames(manifest, diff).map(async (frame, i) => {
    const image = images[`../assets/demo/${frame.file}`]?.default;
    if (!image) throw new Error(`src/assets/demo/${frame.file} is missing`);
    const change = diff.frames[i]!;
    return {
      ...frame,
      image,
      full: (await getImage({ src: image, width: 960, format: 'webp' })).src,
      // The changed area as CSS for the box over the frame; empty when nothing changed.
      boxAttr: frame.box
        ? `left:${frame.box.x}%;top:${frame.box.y}%;width:${frame.box.width}%;height:${frame.box.height}%`
        : '',
      json: JSON.stringify(change, null, 2),
      bar: barHeight(change.changed_fraction, largestChange),
    };
  }),
);

const timing: Timing = {
  frames: manifest.frames.map((frame) => frame.t_ms),
  clickMs: click.t_ms,
  markMs: mark.t_ms,
  durationMs: manifest.duration_ms,
  bannerFrame: banner.shown,
  stepCount: steps.length,
};

export {
  banner,
  click,
  contactSheet,
  diff,
  gif,
  manifest,
  mark,
  markIndex,
  mp4Url,
  result,
  steps,
  story,
  strip,
  timing,
};
