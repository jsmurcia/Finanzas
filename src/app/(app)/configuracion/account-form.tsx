"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAccount } from "./actions";
import { CurrencyInput } from "@/components/currency-input";

export function AccountForm() {
  const [state, formAction, pending] = useActionState(createAccount, null);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1 text-sm text-text-muted">
        Nombre
        <input
          name="name"
          type="text"
          required
          placeholder="Ej. Cuenta de ahorros"
          className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-text-muted">
        Tipo
        <input
          name="type"
          type="text"
          required
          placeholder="Ej. banco, efectivo"
          className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
        />
      </label>
      <CurrencyInput
        name="initial_balance"
        label="Saldo inicial"
        defaultValue={0}
        labelClassName="flex flex-col gap-1 text-sm text-text-muted"
        className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
      />
      {state?.error && <p className="text-sm text-expense">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-bold text-[#1a1310] disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}
