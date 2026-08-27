"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SettingsFormState = { error: string } | null;

function revalidateAll() {
  revalidatePath("/configuracion");
  revalidatePath("/transacciones");
  revalidatePath("/dashboard");
  revalidatePath("/reportes");
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return supabase;
}

export async function createCategory(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await requireUser();

  try {
    const name = String(formData.get("name") ?? "").trim();
    const kind = String(formData.get("kind") ?? "");
    const color = String(formData.get("color") ?? "").trim();
    if (!name) throw new Error("Escribe un nombre para la categoría.");
    if (kind !== "income" && kind !== "expense") {
      throw new Error("Selecciona un tipo válido.");
    }

    const { error } = await supabase
      .from("categories")
      .insert({ name, kind, color: color || null });

    if (error) throw new Error("No se pudo crear la categoría.");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error inesperado.",
    };
  }

  revalidateAll();
  return null;
}

export async function updateCategory(
  id: string,
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await requireUser();

  try {
    const name = String(formData.get("name") ?? "").trim();
    const kind = String(formData.get("kind") ?? "");
    const color = String(formData.get("color") ?? "").trim();
    if (!name) throw new Error("Escribe un nombre para la categoría.");
    if (kind !== "income" && kind !== "expense") {
      throw new Error("Selecciona un tipo válido.");
    }

    const { error } = await supabase
      .from("categories")
      .update({ name, kind, color: color || null })
      .eq("id", id);

    if (error) throw new Error("No se pudo actualizar la categoría.");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error inesperado.",
    };
  }

  revalidateAll();
  return null;
}

export async function deleteCategory(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    throw new Error(
      "No se pudo eliminar la categoría (puede estar en uso por alguna transacción)."
    );
  }

  revalidateAll();
}

export async function createAccount(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await requireUser();

  try {
    const name = String(formData.get("name") ?? "").trim();
    const type = String(formData.get("type") ?? "").trim();
    const initialBalance = Number(formData.get("initial_balance") ?? 0);
    if (!name) throw new Error("Escribe un nombre para la cuenta.");
    if (!type) throw new Error("Escribe un tipo de cuenta.");
    if (!Number.isFinite(initialBalance)) {
      throw new Error("El saldo inicial debe ser un número.");
    }

    const { error } = await supabase
      .from("accounts")
      .insert({ name, type, initial_balance: initialBalance });

    if (error) throw new Error("No se pudo crear la cuenta.");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error inesperado.",
    };
  }

  revalidateAll();
  return null;
}

export async function updateAccount(
  id: string,
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const supabase = await requireUser();

  try {
    const name = String(formData.get("name") ?? "").trim();
    const type = String(formData.get("type") ?? "").trim();
    const initialBalance = Number(formData.get("initial_balance") ?? 0);
    if (!name) throw new Error("Escribe un nombre para la cuenta.");
    if (!type) throw new Error("Escribe un tipo de cuenta.");
    if (!Number.isFinite(initialBalance)) {
      throw new Error("El saldo inicial debe ser un número.");
    }

    const { error } = await supabase
      .from("accounts")
      .update({ name, type, initial_balance: initialBalance })
      .eq("id", id);

    if (error) throw new Error("No se pudo actualizar la cuenta.");
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Error inesperado.",
    };
  }

  revalidateAll();
  return null;
}

export async function deleteAccount(formData: FormData) {
  const supabase = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) {
    throw new Error(
      "No se pudo eliminar la cuenta (puede estar en uso por alguna transacción)."
    );
  }

  revalidateAll();
}
