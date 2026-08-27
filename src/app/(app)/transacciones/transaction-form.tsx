"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { CurrencyInput } from "@/components/currency-input";
import type { Account, Category } from "@/lib/finance/types";
import type { TransactionFormState } from "./actions";

const NEW_CATEGORY = "__new__";

function today() {
  return new Date().toISOString().slice(0, 10);
}

type TransactionFormProps = {
  action: (
    state: TransactionFormState,
    formData: FormData
  ) => Promise<TransactionFormState>;
  categories: Category[];
  accounts: Account[];
  initial?: {
    type: "income" | "expense";
    amount: number;
    occurred_on: string;
    category_id: string;
    account_id: string;
    note: string | null;
  };
  submitLabel: string;
  pendingLabel: string;
};

export function TransactionForm({
  action,
  categories,
  accounts,
  initial,
  submitLabel,
  pendingLabel,
}: TransactionFormProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);
  const [type, setType] = useState<"income" | "expense">(
    initial?.type ?? "expense"
  );
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.kind === type),
    [categories, type]
  );

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error && !initial) {
      formRef.current?.reset();
      setType("expense");
      setCategoryId("");
    }
    wasPending.current = pending;
  }, [pending, state, initial]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Tipo
          <select
            name="type"
            value={type}
            onChange={(event) => {
              setType(event.target.value as "income" | "expense");
              setCategoryId("");
            }}
            className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
          >
            <option value="expense">Egreso</option>
            <option value="income">Ingreso</option>
          </select>
        </label>
        <CurrencyInput
          name="amount"
          label="Monto"
          required
          defaultValue={initial?.amount}
          labelClassName="flex flex-col gap-1 text-sm text-text-muted"
          className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Fecha
          <input
            name="occurred_on"
            type="date"
            required
            defaultValue={initial?.occurred_on ?? today()}
            className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Cuenta
          <select
            name="account_id"
            required
            defaultValue={initial?.account_id ?? accounts[0]?.id ?? ""}
            className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm text-text-muted">
        Categoría
        <select
          name="category_id"
          required
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
        >
          <option value="" disabled>
            Selecciona una categoría
          </option>
          {visibleCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
          <option value={NEW_CATEGORY}>+ Crear categoría nueva</option>
        </select>
      </label>

      {categoryId === NEW_CATEGORY && (
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Nombre de la categoría nueva
          <input
            name="new_category_name"
            type="text"
            required
            placeholder={
              type === "income" ? "Ej. Trabajo ocasional" : "Ej. Mascotas"
            }
            className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
          />
        </label>
      )}

      <label className="flex flex-col gap-1 text-sm text-text-muted">
        Nota (opcional)
        <input
          name="note"
          type="text"
          defaultValue={initial?.note ?? ""}
          className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
        />
      </label>

      {state?.error && (
        <div className="flex flex-col gap-2 rounded-[10px] border border-expense/40 bg-expense-bg p-3">
          <p className="text-sm text-expense">{state.error}</p>
          {state.insufficientBalance && (
            <Link
              href="/deudas"
              className="self-start text-sm font-medium text-accent underline hover:text-accent-strong"
            >
              Ir a Deudas → Pedir más
            </Link>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-[#1a1310] disabled:opacity-60"
      >
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
