// Settled-state pixel diff (stipple-masthead bar: 0.0000%).
// Usage: node docs/design-lab/diff-settled.mjs a.png b.png
import sharp from "sharp";

const [a, b] = process.argv.slice(2);
const [imgA, imgB] = await Promise.all(
  [a, b].map((p) =>
    sharp(p).raw().toBuffer({ resolveWithObject: true })
  )
);
if (
  imgA.info.width !== imgB.info.width ||
  imgA.info.height !== imgB.info.height
) {
  console.log(`SIZE MISMATCH: ${imgA.info.width}x${imgA.info.height} vs ${imgB.info.width}x${imgB.info.height}`);
  process.exit(2);
}
const total = imgA.info.width * imgA.info.height;
const ch = imgA.info.channels;
let diff = 0;
let maxDelta = 0;
for (let i = 0; i < total; i++) {
  let d = 0;
  for (let c = 0; c < ch; c++) {
    d = Math.max(d, Math.abs(imgA.data[i * ch + c] - imgB.data[i * ch + c]));
  }
  if (d > 0) {
    diff++;
    if (d > maxDelta) maxDelta = d;
  }
}
console.log(
  `${a} vs ${b}: ${diff} of ${total} px differ (${((diff / total) * 100).toFixed(4)}%), max channel delta ${maxDelta}`
);
