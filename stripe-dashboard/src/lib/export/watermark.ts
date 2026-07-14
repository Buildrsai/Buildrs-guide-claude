import { WATERMARK_TEXT } from "@/components/shell/watermark-overlay";

/**
 * A canvas that has had the simulation watermark rasterized into its
 * pixels. `download()` only accepts this branded type, so every export
 * path is forced through `stampWatermark` — the watermark cannot be
 * skipped or stripped.
 */
export type StampedCanvas = HTMLCanvasElement & {
  readonly __watermarked: unique symbol;
};

/**
 * Burns the watermark into the bitmap: a tiled diagonal text layer across
 * the whole image plus an opaque badge in the bottom-right corner.
 */
export function stampWatermark(canvas: HTMLCanvasElement): StampedCanvas {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot get 2d context to stamp watermark");
  const { width, height } = canvas;
  const scale = Math.max(1, Math.min(width, height) / 900);

  // tiled diagonal text
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = "#0a2540";
  ctx.font = `600 ${Math.round(22 * scale)}px Inter, sans-serif`;
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-24 * Math.PI) / 180);
  const stepX = 620 * scale;
  const stepY = 140 * scale;
  const spanX = Math.ceil(Math.hypot(width, height) / stepX) + 2;
  const spanY = Math.ceil(Math.hypot(width, height) / stepY) + 2;
  for (let row = -spanY; row <= spanY; row++) {
    const offset = row % 2 === 0 ? 0 : stepX / 2;
    for (let col = -spanX; col <= spanX; col++) {
      ctx.fillText(WATERMARK_TEXT, col * stepX + offset, row * stepY);
    }
  }
  ctx.restore();

  // opaque badge bottom-right
  ctx.save();
  const font = `500 ${Math.round(13 * scale)}px Inter, sans-serif`;
  ctx.font = font;
  const paddingX = 10 * scale;
  const paddingY = 6 * scale;
  const metrics = ctx.measureText(WATERMARK_TEXT);
  const badgeW = metrics.width + paddingX * 2;
  const badgeH = 18 * scale + paddingY * 2;
  const x = width - badgeW - 12 * scale;
  const y = height - badgeH - 12 * scale;
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = "#0a2540";
  ctx.beginPath();
  ctx.roundRect(x, y, badgeW, badgeH, 4 * scale);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(WATERMARK_TEXT, x + paddingX, y + badgeH / 2 + 1 * scale);
  ctx.restore();

  return canvas as StampedCanvas;
}
