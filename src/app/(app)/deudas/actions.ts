"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DebtFormState = { error?: string; message?: string } | null;

function parseAmount(raw: FormDataEntryValue | null): number {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("El monto debe ser un número mayor que cero.");
  }
  return value;
}

export async function createDebt(
  _prevState: DebtFormState,
  formData: FormData
): Promise<DebtFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) throw new Error("Escribe el nombre del acreedor.");

    const { error } = await supabase
      .from("debts")
      .insert({ name, kind: "persona", current_balance: 0, status: "active" });

    if (error) throw new Error("No se pudo crear la deuda.");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error inesperado.",
    };
  }

  revalidatePath("/deudas");
  return null;
}

export async function addDebtMovement(
  debtId: string,
  type: "advance" | "payment",
  _prevState: DebtFormState,
  formData: FormData
): Promise<DebtFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let successMessage: string | undefined;

  try {
    const amount = parseAmount(formData.get("amount"));
    const occurredOn = String(formData.get("occurred_on") ?? "");
    const note = String(formData.get("note") ?? "").trim();
    if (!occurredOn) throw new Error("Selecciona una fecha.");

    const { data: debt, error: fetchError } = await supabase
      .from("debts")
      .select("current_balance, name")
      .eq("id", debtId)
      .single();

    if (fetchError || !debt) throw new Error("No se encontró la deuda.");

    const { error: insertError } = await supabase
      .from("debt_movements")
      .insert({
        debt_id: debtId,
        type,
        amount,
        occurred_on: occurredOn,
        note: note || null,
      });

    if (insertError) throw new Error("No se pudo registrar el movimiento.");

    const delta = type === "advance" ? amount : -amount;
    const newBalance = debt.current_balance + delta;
    const willArchive = type === "payment" && newBalance === 0;

    const { error: updateError } = await supabase
      .from("debts")
      .update(
        willArchive
          ? { current_balance: newBalance, status: "archived" }
          : { current_balance: newBalance }
      )
      .eq("id", debtId);

    if (updateError) throw new Error("No se pudo actualizar el saldo.");

    if (willArchive) {
      successMessage = `Deuda con ${debt.name} saldada ✓`;
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error inesperado.",
    };
  }

  revalidatePath("/deudas");
  revalidatePath("/dashboard");
  return successMessage ? { message: successMessage } : null;
}

// `debts.current_balance` es una caché que solo se actualiza cuando un
// movimiento se registra a través de la app (ver addDebtMovement). Si un
// debt_movement se edita o borra directamente en la base de datos, la caché
// queda desincronizada — esta acción la recalcula desde la fuente de verdad.
export async function recalculateDebtBalance(
  debtId: string
): Promise<DebtFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: movements, error: fetchError } = await supabase
    .from("debt_movements")
    .select("type, amount")
    .eq("debt_id", debtId);

  if (fetchError) {
    return { error: "No se pudieron leer los movimientos." };
  }

  const balance = (movements ?? []).reduce(
    (sum, movement) =>
      sum + (movement.type === "advance" ? movement.amount : -movement.amount),
    0
  );

  const { error: updateError } = await supabase
    .from("debts")
    .update({
      current_balance: balance,
      status: balance === 0 ? "archived" : "active",
    })
    .eq("id", debtId);

  if (updateError) {
    return { error: "No se pudo actualizar el saldo." };
  }

  revalidatePath("/deudas");
  revalidatePath("/dashboard");
  return { message: `Saldo recalculado: ${balance}` };
}
