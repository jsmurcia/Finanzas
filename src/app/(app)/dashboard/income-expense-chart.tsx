"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { currency } from "@/lib/finance/format";

type IncomeExpenseChartProps = {
  data: { name: string; value: number; color: string }[];
};

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="35%">
          <CartesianGrid vertical={false} stroke="var(--border-soft)" />
          <XAxis
            dataKey="name"
            stroke="var(--text-faint)"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--text-faint)"
            tickLine={false}
            axisLine={false}
            width={70}
            tickFormatter={(value: number) =>
              new Intl.NumberFormat("es-CO", {
                notation: "compact",
                maximumFractionDigits: 1,
              }).format(value)
            }
          />
          <Tooltip
            cursor={{ fill: "var(--bg-elevated-2)" }}
            contentStyle={{
              background: "var(--bg-elevated-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              color: "var(--text)",
            }}
            formatter={(value) => currency.format(Number(value))}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
