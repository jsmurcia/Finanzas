"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { deleteCategory, updateCategory } from "./actions";
import type { Category } from "@/lib/finance/types";

const KIND_LABELS: Record<string, string> = {
  income: "Ingreso",
  expense: "Egreso",
};

export function CategoryRow({ category }: { category: Category }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateAction = updateCategory.bind(null, category.id);
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
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 shrink-0 rounded-full border border-border"
            style={{ background: category.color ?? "var(--text-faint)" }}
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text">
              {category.name}
            </span>
            <span className="text-xs text-text-faint">
              {KIND_LABELS[category.kind]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-sm text-text-muted underline hover:text-text"
          >
            Editar
          </button>
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={category.id} />
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
            defaultValue={category.name}
            required
            className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2 text-text"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Tipo
          <select
            name="kind"
            defaultValue={category.kind}
            className="rounded-[10px] border border-border bg-elevated-2 px-3 py-2 text-text"
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
            defaultValue={
              category.color?.startsWith("#") ? category.color : "#d98a4e"
            }
            className="h-10 w-14 rounded-[10px] border border-border bg-elevated-2 px-1 py-1"
          />
        </label>
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
