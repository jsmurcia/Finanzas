"use client";

import { useActionState, useEffect, useRef } from "react";
import { createDebt } from "./actions";

export function DebtForm() {
  const [state, formAction, pending] = useActionState(createDebt, null);
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
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-1 text-sm text-text-muted">
        Nombre del acreedor
        <input
          name="name"
          type="text"
          required
          placeholder="Ej. Andrés"
          className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
        />
      </label>
      {state?.error && <p className="text-sm text-expense">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-bold text-[#1a1310] disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear deuda"}
      </button>
    </form>
  );
}
