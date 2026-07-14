import { captureNode, findCaptureRoot, type PixelRatio } from "./capture";
import { stampWatermark } from "./watermark";
import { downloadStampedPng } from "./download";

function fileStamp(): string {
  // wall-clock here is fine — it names files, it never feeds the dataset
  return new Date().toISOString().slice(0, 19).replaceAll(":", "-");
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function exportFullPage(
  accountName: string,
  pageName: string,
  ratio: PixelRatio,
): Promise<void> {
  const canvas = await captureNode(findCaptureRoot(), { pixelRatio: ratio });
  const stamped = stampWatermark(canvas);
  downloadStampedPng(
    stamped,
    `${slug(accountName)}-${slug(pageName)}-${ratio}x-${fileStamp()}`,
  );
}

export async function exportCard(
  el: HTMLElement,
  accountName: string,
  cardName: string,
  ratio: PixelRatio = 2,
): Promise<void> {
  const canvas = await captureNode(el, { pixelRatio: ratio });
  const stamped = stampWatermark(canvas);
  downloadStampedPng(
    stamped,
    `${slug(accountName)}-card-${slug(cardName)}-${ratio}x-${fileStamp()}`,
  );
}

/** 1920×1080 frame for YouTube: capture at 2x then cover-fit crop. */
export async function exportYouTubeFrame(
  accountName: string,
  pageName: string,
): Promise<void> {
  const source = await captureNode(findCaptureRoot(), { pixelRatio: 2 });
  const target = document.createElement("canvas");
  target.width = 1920;
  target.height = 1080;
  const ctx = target.getContext("2d");
  if (!ctx) throw new Error("Cannot create 16:9 canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, target.width, target.height);

  const scale = Math.max(
    target.width / source.width,
    target.height / source.height,
  );
  const w = source.width * scale;
  const h = source.height * scale;
  ctx.drawImage(source, (target.width - w) / 2, 0, w, h);

  const stamped = stampWatermark(target);
  downloadStampedPng(
    stamped,
    `${slug(accountName)}-${slug(pageName)}-youtube-16x9-${fileStamp()}`,
  );
}
