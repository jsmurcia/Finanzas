"use client";

import { useEffect, useState } from "react";
import { DebtCard } from "./debt-card";
import type { Debt, DebtMovement } from "@/lib/finance/types";

export function DeudasList({
  debts,
  movementsByDebt,
}: {
  debts: Debt[];
  movementsByDebt: Record<string, DebtMovement[]>;
}) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timeout);
  }, [toast]);

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="rounded-2xl border border-border bg-elevated-2 px-4 py-3 text-sm font-medium text-income">
          {toast}
        </div>
      )}
      {debts.length === 0 ? (
        <p className="text-sm text-text-muted">
          Todavía no has registrado deudas.
        </p>
      ) : (
        debts.map((debt) => (
          <DebtCard
            key={debt.id}
            debt={debt}
            movements={movementsByDebt[debt.id] ?? []}
            onSettled={setToast}
          />
        ))
      )}
    </div>
  );
}
