import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currentMonthRange, monthFormatter } from "@/lib/finance/format";
import { CategoryDonutChart } from "./category-donut-chart";
import { MonthlyComparisonChart } from "./monthly-comparison-chart";

const MONTHS_BACK = 6;

const PALETTE = [
  "var(--accent)",
  "var(--cat-food)",
  "var(--cat-transport)",
  "var(--warn)",
  "var(--income)",
  "var(--expense)",
  "var(--text-faint)",
];

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ReportesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { start: monthStart, end: monthEnd } = currentMonthRange();

  const now = new Date();
  const earliest = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1), 1);
  const rangeStart = earliest.toISOString().slice(0, 10);

  const [{ data: monthExpenses }, { data: rangeExpenses }] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount, categories(name, color)")
      .eq("type", "expense")
      .gte("occurred_on", monthStart)
      .lte("occurred_on", monthEnd),
    supabase
      .from("transactions")
      .select("amount, occurred_on")
      .eq("type", "expense")
      .gte("occurred_on", rangeStart)
      .lte("occurred_on", monthEnd),
  ]);

  const categoryTotals = new Map<
    string,
    { name: string; color: string | null; value: number }
  >();
  for (const row of (monthExpenses ?? []) as unknown as Array<{
    amount: number;
    categories: { name: string; color: string | null } | null;
  }>) {
    const name = row.categories?.name ?? "Sin categoría";
    const existing = categoryTotals.get(name);
    if (existing) {
      existing.value += row.amount;
    } else {
      categoryTotals.set(name, {
        name,
        color: row.categories?.color ?? null,
        value: row.amount,
      });
    }
  }
  const categoryData = Array.from(categoryTotals.values())
    .sort((a, b) => b.value - a.value)
    .map((entry, index) => ({
      name: entry.name,
      value: entry.value,
      color: entry.color || PALETTE[index % PALETTE.length],
    }));

  const monthBuckets = new Map<string, number>();
  for (let i = 0; i < MONTHS_BACK; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1 - i), 1);
    monthBuckets.set(monthKey(date), 0);
  }
  for (const row of rangeExpenses ?? []) {
    const key = row.occurred_on.slice(0, 7);
    if (monthBuckets.has(key)) {
      monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + row.amount);
    }
  }
  const monthlyData = Array.from(monthBuckets.entries()).map(([key, value]) => {
    const [year, month] = key.split("-").map(Number);
    return {
      name: monthFormatter.format(new Date(year, month - 1, 1)),
      value,
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold text-text">
          Reportes
        </h1>
      </header>

      <section className="rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-heading mb-4 text-lg font-medium text-text">
          Gasto por categoría (este mes)
        </h2>
        <CategoryDonutChart data={categoryData} />
      </section>

      <section className="rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-heading mb-4 text-lg font-medium text-text">
          Comparación de gasto total (últimos {MONTHS_BACK} meses)
        </h2>
        <MonthlyComparisonChart data={monthlyData} />
      </section>
    </div>
  );
}
