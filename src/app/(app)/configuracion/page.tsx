import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "./category-form";
import { CategoryRow } from "./category-row";
import { AccountForm } from "./account-form";
import { AccountRow } from "./account-row";
import type { Account, Category } from "@/lib/finance/types";

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: categories }, { data: accounts }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("accounts").select("*").order("name"),
  ]);

  const categoryList = (categories ?? []) as Category[];
  const accountList = (accounts ?? []) as Account[];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-8">
      <header>
        <h1 className="font-heading text-2xl font-semibold text-text">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-text-muted">Moneda: COP</p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-medium text-text">
          Categorías
        </h2>
        <div className="rounded-2xl border border-border bg-elevated p-6">
          <CategoryForm />
        </div>
        {categoryList.length === 0 ? (
          <p className="text-sm text-text-muted">
            Todavía no has creado categorías.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-elevated">
            {categoryList.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-medium text-text">
          Cuentas
        </h2>
        <div className="rounded-2xl border border-border bg-elevated p-6">
          <AccountForm />
        </div>
        {accountList.length === 0 ? (
          <p className="text-sm text-text-muted">
            Todavía no has creado cuentas.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-elevated">
            {accountList.map((account) => (
              <AccountRow key={account.id} account={account} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
