"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategory } from "./actions";

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, null);
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
          placeholder="Ej. Mascotas"
          className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-text-muted">
        Tipo
        <select
          name="kind"
          defaultValue="expense"
          className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2.5 text-text"
        >
          <option value="expense">Egreso</option>
          <option value="income">Ingreso</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-text-muted">
        Color
        <input
          name="color"
          type="color"
          defaultValue="#d98a4e"
          className="h-[42px] w-14 rounded-[10px] border border-border bg-elevated-2 px-1 py-1"
        />
      </label>
      {state?.error && <p className="text-sm text-expense">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[10px] bg-accent px-4 py-2.5 text-sm font-bold text-[#1a1310] disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear categoría"}
      </button>
    </form>
  );
}
