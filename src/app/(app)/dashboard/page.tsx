import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currency, dateFormatter, currentMonthRange } from "@/lib/finance/format";
import { getAvailableBalance } from "@/lib/finance/balance";
import { IncomeExpenseChart } from "./income-expense-chart";
import { IncomeSummary } from "./income-summary";
import type { TransactionWithRelations } from "@/lib/finance/types";

type RecentMovement = {
  id: string;
  occurred_on: string;
  label: string;
  amount: number;
  colorClass: "text-income" | "text-expense";
  sign: "+" | "-";
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { start, end } = currentMonthRange();

  const [
    { data: monthTransactions },
    { data: activeDebts },
    { data: recentTransactions },
    { data: recentDebtMovements },
    availableBalance,
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*, categories(name, color), accounts(name)")
      .gte("occurred_on", start)
      .lte("occurred_on", end)
      .order("occurred_on", { ascending: false }),
    supabase.from("debts").select("current_balance").eq("status", "active"),
    supabase
      .from("transactions")
      .select("*, categories(name, color), accounts(name)")
      .order("occurred_on", { ascending: false })
      .limit(8),
    supabase
      .from("debt_movements")
      .select("*, debts(name)")
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
    getAvailableBalance(supabase),
  ]);

  const monthTransactionsTyped = (monthTransactions ??
    []) as TransactionWithRelations[];
  const monthIncomeTransactions = monthTransactionsTyped.filter(
    (row) => row.type === "income"
  );
  const monthIncome = monthIncomeTransactions.reduce(
    (sum, row) => sum + row.amount,
    0
  );
  const monthExpense = monthTransactionsTyped
    .filter((row) => row.type === "expense")
    .reduce((sum, row) => sum + row.amount, 0);
  const totalDebt = (activeDebts ?? []).reduce(
    (sum, row) => sum + row.current_balance,
    0
  );

  const transactionMovements: RecentMovement[] = (
    (recentTransactions ?? []) as TransactionWithRelations[]
  ).map((transaction) => ({
    id: `t-${transaction.id}`,
    occurred_on: transaction.occurred_on,
    label: transaction.categories?.name ?? "Sin categoría",
    amount: transaction.amount,
    colorClass: transaction.type === "income" ? "text-income" : "text-expense",
    sign: transaction.type === "income" ? "+" : "-",
  }));

  const debtMovements: RecentMovement[] = (recentDebtMovements ?? []).map(
    (movement) => ({
      id: `d-${movement.id}`,
      occurred_on: movement.occurred_on,
      label:
        movement.type === "advance"
          ? `Préstamo — ${movement.debts?.name ?? "Sin acreedor"}`
          : `Abono — ${movement.debts?.name ?? "Sin acreedor"}`,
      amount: movement.amount,
      colorClass: movement.type === "advance" ? "text-expense" : "text-income",
      sign: movement.type === "advance" ? "+" : "-",
    })
  );

  const recentMovements = [...transactionMovements, ...debtMovements]
    .sort((a, b) => {
      if (a.occurred_on === b.occurred_on) return 0;
      return a.occurred_on < b.occurred_on ? 1 : -1;
    })
    .slice(0, 8);

  const chartData = [
    { name: "Ingresos", value: monthIncome, color: "var(--income)" },
    { name: "Egresos", value: monthExpense, color: "var(--expense)" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold text-text">
          Dashboard
        </h1>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-elevated p-6">
          <p className="text-sm text-text-muted">Balance disponible hoy</p>
          <p
            className={`font-heading mt-2 text-2xl font-semibold ${
              availableBalance >= 0 ? "text-income" : "text-expense"
            }`}
          >
            {currency.format(availableBalance)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-elevated p-6">
          <p className="text-sm text-text-muted">Deuda total pendiente</p>
          <p className="font-heading mt-2 text-2xl font-semibold text-expense">
            {currency.format(totalDebt)}
          </p>
        </div>
        <IncomeSummary total={monthIncome} transactions={monthIncomeTransactions} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium text-text">
          Movimientos recientes
        </h2>
        {recentMovements.length === 0 ? (
          <p className="text-sm text-text-muted">
            Todavía no hay movimientos registrados.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-elevated">
            {recentMovements.map((movement) => (
              <li
                key={movement.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-text">
                    {movement.label}
                  </span>
                  <span className="text-xs text-text-faint">
                    {dateFormatter.format(
                      new Date(`${movement.occurred_on}T00:00:00`)
                    )}
                  </span>
                </div>
                <span
                  className={`font-heading font-semibold ${movement.colorClass}`}
                >
                  {movement.sign}
                  {currency.format(movement.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-heading mb-4 text-lg font-medium text-text">
          Ingresos vs. egresos del mes
        </h2>
        <IncomeExpenseChart data={chartData} />
      </section>
    </div>
  );
}
