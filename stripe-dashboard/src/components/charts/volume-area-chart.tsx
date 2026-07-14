"use client";

import {
  Area,
  AreaChart,
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

/**
 * The main Overview chart: solid line for the current period, dashed line
 * for the previous period, Stripe-style.
 */
export function VolumeAreaChart({
  data,
  height = 220,
  formatValue,
}: {
  data: SeriesPoint[];
  height?: number;
  formatValue: (v: number) => string;
}) {
  const mounted = useIsMounted();
  if (!mounted) return <div style={{ height }} />;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
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
          cursor={{ stroke: CHART.border }}
          contentStyle={{
            borderRadius: 8,
            border: `1px solid ${CHART.border}`,
            boxShadow: "0 6px 24px rgba(10,37,64,0.12)",
            fontSize: 12,
          }}
          labelFormatter={(label) => formatDateShort(String(label))}
          formatter={(value, name) => [
            formatValue(Number(value ?? 0)),
            name === "value" ? "This period" : "Previous period",
          ]}
        />
        <Area
          type="monotone"
          dataKey="previous"
          stroke={CHART.primarySoft}
          strokeDasharray="4 4"
          strokeWidth={1.5}
          fill="transparent"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART.primary}
          strokeWidth={2}
          fill={CHART.areaFill}
          dot={false}
          activeDot={{ r: 3, fill: CHART.primary }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
