import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateTransaction } from "../../actions";
import { TransactionForm } from "../../transaction-form";
import type { Account, Category, Transaction } from "@/lib/finance/types";

export default async function EditarTransaccionPage(
  props: PageProps<"/transacciones/[id]/editar">
) {
  const { id } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: transaction }, { data: categories }, { data: accounts }] =
    await Promise.all([
      supabase.from("transactions").select("*").eq("id", id).single(),
      supabase.from("categories").select("*").order("name"),
      supabase.from("accounts").select("*").order("name"),
    ]);

  if (!transaction) notFound();

  const boundUpdate = updateTransaction.bind(null, id);
  const current = transaction as Transaction;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:px-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        Editar transacción
      </h1>
      <section className="rounded-2xl border border-border bg-elevated p-6">
        <TransactionForm
          action={boundUpdate}
          categories={(categories ?? []) as Category[]}
          accounts={(accounts ?? []) as Account[]}
          initial={{
            type: current.type,
            amount: current.amount,
            occurred_on: current.occurred_on,
            category_id: current.category_id,
            account_id: current.account_id,
            note: current.note,
          }}
          submitLabel="Guardar cambios"
          pendingLabel="Guardando…"
        />
      </section>
    </div>
  );
}
