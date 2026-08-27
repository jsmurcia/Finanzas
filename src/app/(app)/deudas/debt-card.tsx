"use client";

import { useState, useTransition } from "react";
import {
  addDebtMovement,
  recalculateDebtBalance,
  type DebtFormState,
} from "./actions";
import { currency, dateFormatter, today } from "@/lib/finance/format";
import { CurrencyInput } from "@/components/currency-input";
import type { Debt, DebtMovement } from "@/lib/finance/types";

const PREVIEW_COUNT = 5;

const KIND_LABELS: Record<string, string> = {
  persona: "Persona",
  tarjeta: "Tarjeta",
  banco: "Banco",
  otro: "Otro",
};

type MovementFormProps = {
  action: (state: DebtFormState, formData: FormData) => Promise<DebtFormState>;
  submitLabel: string;
  onDone: () => void;
  onSettled?: (message: string) => void;
};

function MovementForm({ action, submitLabel, onDone, onSettled }: MovementFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    const result = await action(null, formData);

    if (result?.error) {
      setPending(false);
      setError(result.error);
      return;
    }

    // Call onSettled synchronously right after the action resolves — the
    // debt card can unmount (row filtered out once archived) as soon as the
    // route refresh triggered by the action's revalidatePath lands, and a
    // pending-driven effect on this component would race that unmount and
    // never fire, silently swallowing the "saldada" confirmation.
    if (result?.message) onSettled?.(result.message);
    onDone();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-[10px] border border-border bg-elevated-2 p-4"
    >
      <input type="hidden" name="occurred_on" value={today()} />
      <CurrencyInput
        name="amount"
        label="Monto"
        required
        autoFocus
        labelClassName="flex flex-col gap-1 text-sm text-text-muted"
        className="rounded-[10px] border border-border bg-elevated-3 px-3 py-2 text-text"
      />
      <label className="flex flex-col gap-1 text-sm text-text-muted">
        Nota (opcional)
        <input
          name="note"
          type="text"
          className="rounded-[10px] border border-border bg-elevated-3 px-3 py-2 text-text"
        />
      </label>
      {error && <p className="text-sm text-expense">{error}</p>}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-[10px] border border-border px-3 py-2 text-sm font-medium text-text-muted hover:text-text"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-[10px] bg-accent px-3 py-2 text-sm font-bold text-[#1a1310] disabled:opacity-60"
        >
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function DebtCard({
  debt,
  movements,
  onSettled,
}: {
  debt: Debt;
  movements: DebtMovement[];
  onSettled?: (message: string) => void;
}) {
  const [activeForm, setActiveForm] = useState<"advance" | "payment" | null>(
    null
  );
  const [isRecalculating, startRecalculate] = useTransition();
  const [recalcError, setRecalcError] = useState<string | null>(null);
  const [showAllMovements, setShowAllMovements] = useState(false);

  const advanceAction = addDebtMovement.bind(null, debt.id, "advance");
  const paymentAction = addDebtMovement.bind(null, debt.id, "payment");

  function handleRecalculate() {
    setRecalcError(null);
    startRecalculate(async () => {
      const result = await recalculateDebtBalance(debt.id);
      if (result?.error) {
        setRecalcError(result.error);
        return;
      }
      onSettled?.(result?.message ?? "Saldo recalculado");
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-elevated p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-lg font-medium text-text">
            {debt.name}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-elevated-2 px-2 py-0.5 text-xs text-text-muted">
            {KIND_LABELS[debt.kind] ?? debt.kind}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="font-heading text-2xl font-semibold text-expense">
            {currency.format(debt.current_balance)}
          </p>
          <button
            type="button"
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="text-xs text-text-faint underline hover:text-text-muted disabled:opacity-60"
          >
            {isRecalculating ? "Recalculando…" : "Recalcular saldo"}
          </button>
        </div>
      </div>
      {recalcError && <p className="text-sm text-expense">{recalcError}</p>}

      {activeForm === null ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setActiveForm("advance")}
            className="flex-1 rounded-[10px] bg-elevated-2 px-3 py-2 text-sm font-medium text-text hover:bg-elevated-3"
          >
            Pedir más
          </button>
          <button
            type="button"
            onClick={() => setActiveForm("payment")}
            className="flex-1 rounded-[10px] bg-elevated-2 px-3 py-2 text-sm font-medium text-text hover:bg-elevated-3"
          >
            Abonar
          </button>
        </div>
      ) : (
        <MovementForm
          action={activeForm === "advance" ? advanceAction : paymentAction}
          submitLabel={activeForm === "advance" ? "Pedir más" : "Abonar"}
          onDone={() => setActiveForm(null)}
          onSettled={onSettled}
        />
      )}

      {movements.length > 0 && (
        <ul className="flex flex-col divide-y divide-border-soft border-t border-border-soft pt-2">
          {(showAllMovements
            ? movements
            : movements.slice(0, PREVIEW_COUNT)
          ).map((movement) => (
            <li
              key={movement.id}
              className="flex items-center justify-between gap-4 py-2"
            >
              <div className="flex flex-col">
                <span className="text-sm text-text">
                  {movement.note ||
                    (movement.type === "advance" ? "Préstamo" : "Abono")}
                </span>
                <span className="text-xs text-text-faint">
                  {dateFormatter.format(
                    new Date(`${movement.occurred_on}T00:00:00`)
                  )}
                </span>
              </div>
              <span
                className={
                  movement.type === "advance"
                    ? "text-sm font-semibold text-expense"
                    : "text-sm font-semibold text-income"
                }
              >
                {movement.type === "advance" ? "+" : "-"}
                {currency.format(movement.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {movements.length > PREVIEW_COUNT && (
        <button
          type="button"
          onClick={() => setShowAllMovements((value) => !value)}
          className="self-center text-sm text-text-muted underline hover:text-text"
        >
          {showAllMovements
            ? "Ver menos"
            : `Ver historial completo (${movements.length})`}
        </button>
      )}
    </div>
  );
}
