import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outDir = 'src/assets/lcp';
const publicDir = 'public/media';

function shade(width, height) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="glow" cx="50%" cy="42%" r="23%">
        <stop offset="0%" stop-color="#e6007e" stop-opacity="0.14"/>
        <stop offset="100%" stop-color="#e6007e" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="vignette" cx="50%" cy="48%" r="78%">
        <stop offset="40%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
      </radialGradient>
      <linearGradient id="sides" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#050508" stop-opacity="0.4"/>
        <stop offset="22%" stop-color="#050508" stop-opacity="0"/>
        <stop offset="78%" stop-color="#050508" stop-opacity="0"/>
        <stop offset="100%" stop-color="#050508" stop-opacity="0.4"/>
      </linearGradient>
      <linearGradient id="depth" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#050508" stop-opacity="0.22"/>
        <stop offset="42%" stop-color="#050508" stop-opacity="0"/>
        <stop offset="100%" stop-color="#050508" stop-opacity="0.55"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#vignette)"/>
    <rect width="100%" height="100%" fill="url(#sides)"/>
    <rect width="100%" height="100%" fill="url(#depth)"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
  </svg>`);
}

const jobs = [
  {
    input: 'src/assets/home_motion/space-bg-mobile_comp.webp',
    name: 'space-mobile',
    widths: [480, 768, 1200],
    shade: true,
  },
  {
    input: 'src/assets/home_motion/space-bg-desktop_comp.jpg',
    name: 'space-desktop',
    widths: [960, 1440, 1920],
    shade: true,
  },
  {
    input: 'src/assets/planeta-amarte.jpg',
    name: 'planeta',
    widths: [687],
    outDir: publicDir,
  },
];

await mkdir(outDir, { recursive: true });
await mkdir(publicDir, { recursive: true });

for (const job of jobs) {
  const meta = await sharp(job.input).metadata();
  const sourceWidth = meta.width ?? 0;
  const targetDir = job.outDir ?? outDir;
  const widths = job.widths.filter((width) => width <= sourceWidth);
  if (widths.length === 0) widths.push(sourceWidth);

  for (const width of widths) {
    const outWidth = Math.min(width, sourceWidth);
    const outHeight = Math.round((outWidth * (meta.height ?? sourceWidth)) / sourceWidth);
    const resized = () => sharp(job.input).resize({ width: outWidth, height: outHeight, fit: 'fill' });
    const pipeline = () =>
      job.shade ? resized().composite([{ input: shade(outWidth, outHeight) }]) : resized();
    const avifPath = path.join(targetDir, `${job.name}-${width}.avif`);
    const webpPath = path.join(targetDir, `${job.name}-${width}.webp`);
    await pipeline().avif({ quality: 48, effort: 4 }).toFile(avifPath);
    await pipeline().webp({ quality: 68 }).toFile(webpPath);
    const avif = await sharp(avifPath).metadata();
    const webp = await sharp(webpPath).metadata();
    console.log(
      `${job.name}-${width}`,
      `avif ${avif.width}x${avif.height} ${avif.size}B`,
      `webp ${webp.width}x${webp.height} ${webp.size}B`,
    );
  }
}
