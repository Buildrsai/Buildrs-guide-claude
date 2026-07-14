"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useIsMounted } from "./use-is-mounted";
import { CHART } from "./chart-theme";
import { formatDateShort } from "@/lib/format";
import type { SeriesPoint } from "@/lib/selectors/series";

export function BarSeriesChart({
  data,
  height = 220,
  formatValue,
  tone = "primary",
}: {
  data: SeriesPoint[];
  height?: number;
  formatValue: (v: number) => string;
  tone?: "primary" | "error";
}) {
  const mounted = useIsMounted();
  if (!mounted) return <div style={{ height }} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateShort}
          tick={CHART.axisTick}
          tickLine={false}
          axisLine={{ stroke: CHART.border }}
          minTickGap={40}
        />
        <YAxis
          tickFormatter={(v: number) => formatValue(v)}
          tick={CHART.axisTick}
          tickLine={false}
          axisLine={false}
          width={64}
        />
        <Tooltip
          cursor={{ fill: "rgba(83,58,253,0.05)" }}
          contentStyle={{
            borderRadius: 8,
            border: `1px solid ${CHART.border}`,
            fontSize: 12,
          }}
          labelFormatter={(label) => formatDateShort(String(label))}
          formatter={(value) => [formatValue(Number(value ?? 0)), "Value"]}
        />
        <Bar
          dataKey="value"
          fill={tone === "error" ? CHART.error : CHART.primary}
          radius={[2, 2, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
