// The one real recdr recording the landing page shows. See demo/RECORDING.md.
import type { ImageMetadata } from 'astro';
import contactSheet from '../assets/demo/contact_sheet.png';
import diff from '../assets/demo/diff.json';
import manifest from '../assets/demo/manifest.json';
import gif from '../assets/demo/recording.gif';
import mp4Url from '../assets/demo/recording.mp4?url';
import result from '../assets/demo/result.json';
import { buildFrames, clickPoint } from './frames.ts';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/demo/frames/*.png',
  { eager: true },
);

const frames = buildFrames(manifest, diff).map((frame) => {
  const image = images[`../assets/demo/${frame.file}`]?.default;
  if (!image) throw new Error(`src/assets/demo/${frame.file} is missing`);
  return { ...frame, image };
});

const keyframes = frames.filter((frame) => frame.keyframe).slice(0, 12);
const click = clickPoint(manifest);

export {
  click,
  contactSheet,
  diff,
  frames,
  gif,
  keyframes,
  manifest,
  mp4Url,
  result,
};
