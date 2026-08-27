"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAvailableBalance } from "@/lib/finance/balance";
import { currency } from "@/lib/finance/format";

export type TransactionFormState =
  | { error: string; insufficientBalance?: boolean }
  | null;

const NEW_CATEGORY = "__new__";

function parseType(raw: FormDataEntryValue | null): "income" | "expense" {
  if (raw === "income" || raw === "expense") return raw;
  throw new Error("Tipo de transacción inválido.");
}

function parseAmount(raw: FormDataEntryValue | null): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("El monto debe ser un número mayor que cero.");
  }
  return value;
}

async function resolveCategoryId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData,
  type: "income" | "expense"
): Promise<string> {
  const categoryId = String(formData.get("category_id") ?? "");

  if (categoryId !== NEW_CATEGORY) {
    if (!categoryId) throw new Error("Selecciona una categoría.");
    return categoryId;
  }

  const name = String(formData.get("new_category_name") ?? "").trim();
  if (!name) throw new Error("Escribe un nombre para la categoría nueva.");

  const { data, error } = await supabase
    .from("categories")
    .insert({ name, kind: type })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("No se pudo crear la categoría nueva.");
  }

  return data.id as string;
}

function readTransactionFields(formData: FormData) {
  const type = parseType(formData.get("type"));
  const amount = parseAmount(formData.get("amount"));
  const occurredOn = String(formData.get("occurred_on") ?? "");
  const accountId = String(formData.get("account_id") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!occurredOn) throw new Error("Selecciona una fecha.");
  if (!accountId) throw new Error("Selecciona una cuenta.");

  return { type, amount, occurredOn, accountId, note: note || null };
}

export async function createTransaction(
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let type: "income" | "expense";
  let amount: number;
  let occurredOn: string;
  let accountId: string;
  let note: string | null;
  let categoryId: string;

  try {
    ({ type, amount, occurredOn, accountId, note } =
      readTransactionFields(formData));
    categoryId = await resolveCategoryId(supabase, formData, type);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error inesperado.",
    };
  }

  if (type === "expense") {
    const available = await getAvailableBalance(supabase);
    if (amount > available) {
      return {
        error: `No tienes saldo suficiente — saldo actual: ${currency.format(available)}.`,
        insufficientBalance: true,
      };
    }
  }

  const { error } = await supabase.from("transactions").insert({
    type,
    amount,
    occurred_on: occurredOn,
    category_id: categoryId,
    account_id: accountId,
    note,
  });

  if (error) {
    return { error: "No se pudo guardar la transacción." };
  }

  revalidatePath("/transacciones");
  revalidatePath("/dashboard");
  return null;
}

export async function updateTransaction(
  id: string,
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let type: "income" | "expense";
  let amount: number;
  let occurredOn: string;
  let accountId: string;
  let note: string | null;
  let categoryId: string;

  try {
    ({ type, amount, occurredOn, accountId, note } =
      readTransactionFields(formData));
    categoryId = await resolveCategoryId(supabase, formData, type);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error inesperado.",
    };
  }

  if (type === "expense") {
    const { data: existing } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("id", id)
      .single();

    const available = await getAvailableBalance(supabase);
    const previousEffect =
      existing?.type === "income"
        ? -existing.amount
        : existing?.type === "expense"
          ? existing.amount
          : 0;
    const availableExcludingCurrent = available + previousEffect;

    if (amount > availableExcludingCurrent) {
      return {
        error: `No tienes saldo suficiente — saldo actual: ${currency.format(availableExcludingCurrent)}.`,
        insufficientBalance: true,
      };
    }
  }

  const { error } = await supabase
    .from("transactions")
    .update({
      type,
      amount,
      occurred_on: occurredOn,
      category_id: categoryId,
      account_id: accountId,
      note,
    })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo actualizar la transacción." };
  }

  revalidatePath("/transacciones");
  revalidatePath("/dashboard");
  redirect("/transacciones");
}

export async function deleteTransaction(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error("No se pudo eliminar la transacción.");

  revalidatePath("/transacciones");
  revalidatePath("/dashboard");
}
