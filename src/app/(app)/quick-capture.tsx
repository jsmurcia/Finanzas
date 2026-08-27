"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { createTransaction } from "./transacciones/actions";
import { today } from "@/lib/finance/format";
import { CurrencyInput } from "@/components/currency-input";
import type { Account, Category } from "@/lib/finance/types";

type QuickCaptureProps = {
  categories: Category[];
  accounts: Account[];
  defaultAccountId: string;
};

export function QuickCapture({
  categories,
  accounts,
  defaultAccountId,
}: QuickCaptureProps) {
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [state, formAction, pending] = useActionState(createTransaction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  const expenseCategories = categories.filter(
    (category) => category.kind === "expense"
  );

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      formRef.current?.reset();
      setShowMore(false);
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Agregar gasto"
        className="fixed right-4 bottom-20 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-[#1a1310] shadow-[0_8px_20px_rgba(0,0,0,0.35)] md:bottom-6"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.25}
          strokeLinecap="round"
          className="h-6 w-6"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-elevated p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-heading mb-4 text-lg font-medium text-text">
              Agregar gasto
            </h2>
            <form
              ref={formRef}
              action={formAction}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="type" value="expense" />
              <input type="hidden" name="occurred_on" value={today()} />
              {!showMore && (
                <input
                  type="hidden"
                  name="account_id"
                  value={defaultAccountId}
                />
              )}

              <CurrencyInput
                name="amount"
                label="Monto"
                required
                autoFocus
                labelClassName="flex flex-col gap-1 text-sm text-text-muted"
                className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
              />

              <label className="flex flex-col gap-1 text-sm text-text-muted">
                Categoría
                <select
                  name="category_id"
                  required
                  defaultValue=""
                  className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
                >
                  <option value="" disabled>
                    Selecciona una categoría
                  </option>
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              {!showMore ? (
                <button
                  type="button"
                  onClick={() => setShowMore(true)}
                  className="self-start text-sm text-text-muted underline hover:text-text"
                >
                  Más opciones
                </button>
              ) : (
                <>
                  <label className="flex flex-col gap-1 text-sm text-text-muted">
                    Cuenta
                    <select
                      name="account_id"
                      required
                      defaultValue={defaultAccountId}
                      className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
                    >
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-text-muted">
                    Nota (opcional)
                    <input
                      name="note"
                      type="text"
                      className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
                    />
                  </label>
                </>
              )}

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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-[10px] border border-border px-4 py-2 text-sm font-medium text-text-muted hover:text-text"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-[#1a1310] disabled:opacity-60"
                >
                  {pending ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
