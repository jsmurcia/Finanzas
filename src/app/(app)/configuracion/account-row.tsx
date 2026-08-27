"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { deleteAccount, updateAccount } from "./actions";
import { currency } from "@/lib/finance/format";
import { CurrencyInput } from "@/components/currency-input";
import type { Account } from "@/lib/finance/types";

export function AccountRow({ account }: { account: Account }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateAction = updateAccount.bind(null, account.id);
  const [state, formAction, pending] = useActionState(updateAction, null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setIsEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  if (!isEditing) {
    return (
      <li className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-text">{account.name}</span>
          <span className="text-xs text-text-faint">
            {account.type} · Saldo inicial {currency.format(account.initial_balance)}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-sm text-text-muted underline hover:text-text"
          >
            Editar
          </button>
          <form action={deleteAccount}>
            <input type="hidden" name="id" value={account.id} />
            <button
              type="submit"
              className="text-sm text-text-muted underline hover:text-expense"
            >
              Eliminar
            </button>
          </form>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 p-4">
      <form
        action={formAction}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <label className="flex flex-1 flex-col gap-1 text-sm text-text-muted">
          Nombre
          <input
            name="name"
            type="text"
            defaultValue={account.name}
            required
            className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2 text-text"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Tipo
          <input
            name="type"
            type="text"
            defaultValue={account.type}
            required
            className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2 text-text"
          />
        </label>
        <CurrencyInput
          name="initial_balance"
          label="Saldo inicial"
          defaultValue={account.initial_balance}
          labelClassName="flex flex-col gap-1 text-sm text-text-muted"
          className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2 text-text"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-[10px] border border-border px-3 py-2 text-sm font-medium text-text-muted hover:text-text"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-[10px] bg-accent px-3 py-2 text-sm font-bold text-[#1a1310] disabled:opacity-60"
          >
            {pending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
      {state?.error && <p className="text-sm text-expense">{state.error}</p>}
    </li>
  );
}
