import { toCanvas } from "html-to-image";

export type PixelRatio = 1 | 2 | 4;

/** Maximum canvas edge most browsers allow (~16k px); 4x captures are capped. */
const MAX_EDGE = 16_000;

export async function captureNode(
  el: HTMLElement,
  { pixelRatio }: { pixelRatio: PixelRatio },
): Promise<HTMLCanvasElement> {
  const rect = el.getBoundingClientRect();
  let ratio: number = pixelRatio;
  const maxDim = Math.max(rect.width, el.scrollHeight || rect.height);
  if (maxDim * ratio > MAX_EDGE) ratio = MAX_EDGE / maxDim;
  return toCanvas(el, {
    pixelRatio: ratio,
    backgroundColor: "#ffffff",
    cacheBust: false,
  });
}

export function findCaptureRoot(): HTMLElement {
  const el =
    document.querySelector<HTMLElement>("[data-capture-root]") ?? document.body;
  return el;
}

export function findExportTargets(): { id: string; el: HTMLElement }[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-export-target]"),
  ).map((el) => ({ id: el.dataset.exportTarget ?? "card", el }));
}
