import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DebtForm } from "./debt-form";
import { DeudasList } from "./deudas-list";
import type { Debt, DebtMovement } from "@/lib/finance/types";

export default async function DeudasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: debts } = await supabase
    .from("debts")
    .select("*")
    .eq("status", "active")
    .order("name");

  const debtList = (debts ?? []) as Debt[];
  const debtIds = debtList.map((debt) => debt.id);

  const { data: movements } =
    debtIds.length > 0
      ? await supabase
          .from("debt_movements")
          .select("*")
          .in("debt_id", debtIds)
          .order("occurred_on", { ascending: false })
          .order("created_at", { ascending: false })
      : { data: [] as DebtMovement[] };

  const movementsByDebt: Record<string, DebtMovement[]> = {};
  for (const movement of (movements ?? []) as DebtMovement[]) {
    const list = movementsByDebt[movement.debt_id] ?? [];
    list.push(movement);
    movementsByDebt[movement.debt_id] = list;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold text-text">
          Deudas
        </h1>
      </header>

      <section className="rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-heading mb-4 text-lg font-medium text-text">
          Nueva deuda
        </h2>
        <DebtForm />
      </section>

      <DeudasList debts={debtList} movementsByDebt={movementsByDebt} />
    </div>
  );
}
