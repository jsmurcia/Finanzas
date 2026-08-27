import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAvailableBalance(
  supabase: SupabaseClient
): Promise<number> {
  const [{ data: accounts }, { data: transactions }, { data: debtMovements }] =
    await Promise.all([
      supabase.from("accounts").select("initial_balance"),
      supabase
        .from("transactions")
        .select("type, amount")
        .eq("counts_toward_balance", true),
      supabase
        .from("debt_movements")
        .select("type, amount")
        .eq("counts_toward_balance", true),
    ]);

  const accountsTotal = (accounts ?? []).reduce(
    (sum, account) => sum + account.initial_balance,
    0
  );
  const incomeTotal = (transactions ?? [])
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenseTotal = (transactions ?? [])
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const advanceTotal = (debtMovements ?? [])
    .filter((movement) => movement.type === "advance")
    .reduce((sum, movement) => sum + movement.amount, 0);
  const paymentTotal = (debtMovements ?? [])
    .filter((movement) => movement.type === "payment")
    .reduce((sum, movement) => sum + movement.amount, 0);

  return accountsTotal + incomeTotal - expenseTotal + advanceTotal - paymentTotal;
}
