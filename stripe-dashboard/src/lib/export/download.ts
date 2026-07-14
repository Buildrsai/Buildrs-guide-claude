import type { StampedCanvas } from "./watermark";

/**
 * The ONLY download path in the app. It accepts exclusively a
 * StampedCanvas (produced by stampWatermark), so no export can ever ship
 * without the simulation watermark burnt into its pixels.
 */
export function downloadStampedPng(canvas: StampedCanvas, filename: string): void {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
