"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useIsMounted } from "./use-is-mounted";
import { CHART } from "./chart-theme";

export interface DonutSlice {
  name: string;
  value: number;
}

export function DonutChart({
  data,
  height = 180,
  formatValue,
}: {
  data: DonutSlice[];
  height?: number;
  formatValue?: (v: number) => string;
}) {
  const mounted = useIsMounted();
  if (!mounted) return <div style={{ height }} />;
  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={height} height={height}>
        <PieChart>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${CHART.border}`,
              fontSize: 12,
            }}
            formatter={(value, name) => [
              formatValue
                ? formatValue(Number(value ?? 0))
                : Number(value ?? 0).toLocaleString("en-US"),
              String(name),
            ]}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="95%"
            paddingAngle={2}
            strokeWidth={0}
            isAnimationActive={false}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART.donut[i % CHART.donut.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <ul className="flex flex-col gap-1.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2 caption text-secondary">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: CHART.donut[i % CHART.donut.length] }}
            />
            {d.name}
            <span className="text-muted tabular">
              {formatValue ? formatValue(d.value) : d.value.toLocaleString("en-US")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
