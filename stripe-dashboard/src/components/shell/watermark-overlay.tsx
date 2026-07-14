export const WATERMARK_TEXT = "SIMULATION — DONNÉES FICTIVES";

/**
 * Non-removable simulation watermark. Rendered unconditionally from the root
 * layout so it covers every route (dashboard, admin, presentation). It takes
 * no props on purpose: no flag, setting, or query param can disable it. The
 * export pipeline additionally rasterizes the same text into every PNG.
 */
export function WatermarkOverlay() {
  const rows = Array.from({ length: 12 });
  return (
    <div
      data-testid="watermark"
      aria-hidden
      className="pointer-events-none fixed inset-0 z-9999 select-none overflow-hidden"
    >
      <div className="absolute -inset-[50%] flex rotate-[-24deg] flex-col justify-between opacity-[0.05]">
        {rows.map((_, i) => (
          <div
            key={i}
            className="whitespace-nowrap text-[28px] font-semibold tracking-[0.3em] text-secondary"
            style={{ marginLeft: i % 2 === 0 ? 0 : 140 }}
          >
            {Array.from({ length: 8 })
              .map(() => WATERMARK_TEXT)
              .join("      ")}
          </div>
        ))}
      </div>
      <div
        data-testid="watermark-badge"
        className="absolute right-3 bottom-3 rounded-sm bg-secondary/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white"
      >
        {WATERMARK_TEXT}
      </div>
    </div>
  );
}
