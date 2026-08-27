import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureDefaultAccount, ensureDefaultCategories } from "@/lib/finance/bootstrap";
import type { Account, Category } from "@/lib/finance/types";
import { AppShell } from "./app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ count: accountCount }, { count: categoryCount }] = await Promise.all([
    supabase.from("accounts").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);

  if (!accountCount) await ensureDefaultAccount(supabase);
  if (!categoryCount) await ensureDefaultCategories(supabase);

  const [{ data: accounts }, { data: categories }, { data: lastTransaction }] =
    await Promise.all([
      supabase.from("accounts").select("*").order("name"),
      supabase.from("categories").select("*").order("name"),
      supabase
        .from("transactions")
        .select("account_id")
        .order("occurred_on", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const accountList = (accounts ?? []) as Account[];
  const categoryList = (categories ?? []) as Category[];
  const defaultAccountId =
    lastTransaction?.account_id ?? accountList[0]?.id ?? "";

  return (
    <AppShell
      email={user.email ?? ""}
      accounts={accountList}
      categories={categoryList}
      defaultAccountId={defaultAccountId}
    >
      {children}
    </AppShell>
  );
}
