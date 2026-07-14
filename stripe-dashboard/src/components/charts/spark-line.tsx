"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useIsMounted } from "./use-is-mounted";
import { CHART } from "./chart-theme";
import type { SeriesPoint } from "@/lib/selectors/series";

export function SparkLine({
  data,
  height = 40,
  tone = "primary",
}: {
  data: SeriesPoint[];
  height?: number;
  tone?: "primary" | "error" | "success";
}) {
  const mounted = useIsMounted();
  if (!mounted) return <div style={{ height }} />;
  const stroke =
    tone === "error" ? CHART.error : tone === "success" ? CHART.success : CHART.primary;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Area
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={1.5}
          fill="transparent"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
