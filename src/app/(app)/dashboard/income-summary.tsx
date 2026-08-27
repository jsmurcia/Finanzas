"use client";

import { useState } from "react";
import { currency, dateFormatter } from "@/lib/finance/format";
import type { TransactionWithRelations } from "@/lib/finance/types";

type IncomeSummaryProps = {
  total: number;
  transactions: TransactionWithRelations[];
};

export function IncomeSummary({ total, transactions }: IncomeSummaryProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-border bg-elevated p-6 text-left transition-colors hover:border-border-soft hover:bg-elevated-2/40"
      >
        <p className="text-sm text-text-muted">Ingresos del mes</p>
        <p className="font-heading mt-2 text-2xl font-semibold text-income">
          {currency.format(total)}
        </p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-md flex-col rounded-2xl border border-border bg-elevated p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between gap-4">
              <h2 className="font-heading text-lg font-medium text-text">
                Ingresos del mes
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-text-muted hover:text-text"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  className="h-5 w-5"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <p className="font-heading mb-4 text-xl font-semibold text-income">
              {currency.format(total)}
            </p>

            {transactions.length === 0 ? (
              <p className="text-sm text-text-muted">
                Todavía no hay ingresos registrados este mes.
              </p>
            ) : (
              <ul className="-mx-2 flex flex-col divide-y divide-border overflow-y-auto">
                {transactions.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex items-center justify-between gap-4 px-2 py-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text">
                        {transaction.categories?.name ?? "Sin categoría"}
                      </span>
                      <span className="text-xs text-text-faint">
                        {dateFormatter.format(
                          new Date(`${transaction.occurred_on}T00:00:00`)
                        )}
                        {transaction.accounts?.name
                          ? ` · ${transaction.accounts.name}`
                          : ""}
                        {transaction.note ? ` · ${transaction.note}` : ""}
                      </span>
                    </div>
                    <span className="font-heading shrink-0 font-semibold text-income">
                      +{currency.format(transaction.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
