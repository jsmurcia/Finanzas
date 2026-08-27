import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { currency, dateFormatter } from "@/lib/finance/format";
import { createTransaction, deleteTransaction } from "./actions";
import { TransactionForm } from "./transaction-form";
import type { Account, Category, TransactionWithRelations } from "@/lib/finance/types";

export default async function TransaccionesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: accounts }, { data: categories }, { data: transactions }] =
    await Promise.all([
      supabase.from("accounts").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("transactions")
        .select("*, categories(name, color), accounts(name)")
        .order("occurred_on", { ascending: false }),
    ]);

  const accountList = (accounts ?? []) as Account[];
  const categoryList = (categories ?? []) as Category[];
  const transactionList = (transactions ?? []) as TransactionWithRelations[];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold text-text">
          Transacciones
        </h1>
      </header>

      <section className="rounded-2xl border border-border bg-elevated p-6">
        <h2 className="font-heading mb-4 text-lg font-medium text-text">
          Nueva transacción
        </h2>
        <TransactionForm
          action={createTransaction}
          categories={categoryList}
          accounts={accountList}
          submitLabel="Guardar"
          pendingLabel="Guardando…"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium text-text">
          Movimientos
        </h2>
        {transactionList.length === 0 ? (
          <p className="text-sm text-text-muted">
            Todavía no has registrado transacciones.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-elevated">
            {transactionList.map((transaction) => (
              <li
                key={transaction.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-text">
                    {transaction.categories?.name ?? "Sin categoría"}
                  </span>
                  <span className="text-xs text-text-faint">
                    {dateFormatter.format(
                      new Date(`${transaction.occurred_on}T00:00:00`)
                    )}{" "}
                    · {transaction.accounts?.name ?? "Sin cuenta"}
                    {transaction.note ? ` · ${transaction.note}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={
                      transaction.type === "income"
                        ? "font-heading font-semibold text-income"
                        : "font-heading font-semibold text-expense"
                    }
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {currency.format(transaction.amount)}
                  </span>
                  <Link
                    href={`/transacciones/${transaction.id}/editar`}
                    className="text-sm text-text-muted underline hover:text-text"
                  >
                    Editar
                  </Link>
                  <form action={deleteTransaction}>
                    <input type="hidden" name="id" value={transaction.id} />
                    <button
                      type="submit"
                      className="text-sm text-text-muted underline hover:text-expense"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
