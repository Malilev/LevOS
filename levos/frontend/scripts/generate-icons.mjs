import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');

// Simple SVG icon
const createSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#111827"/>
  <text x="${size/2}" y="${size * 0.68}" font-family="Arial, sans-serif" font-size="${size * 0.55}" font-weight="bold" fill="#3B82F6" text-anchor="middle">L</text>
</svg>
`;

async function generateIcons() {
  const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon.ico', size: 32 },
  ];

  for (const { name, size } of sizes) {
    const svg = Buffer.from(createSvg(size));
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, name));
    console.log(`Generated ${name}`);
  }
}

generateIcons().catch(console.error);
