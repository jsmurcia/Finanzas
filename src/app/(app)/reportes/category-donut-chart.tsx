"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { currency } from "@/lib/finance/format";

type CategoryDonutChartProps = {
  data: { name: string; value: number; color: string }[];
};

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Todavía no hay gastos este mes.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.color}
                stroke="var(--bg-elevated)"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--bg-elevated-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              color: "var(--text)",
            }}
            formatter={(value) => currency.format(Number(value))}
          />
          <Legend
            verticalAlign="bottom"
            formatter={(value: string) => (
              <span style={{ color: "var(--text-muted)" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
