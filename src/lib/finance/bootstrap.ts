import type { SupabaseClient } from "@supabase/supabase-js";

// Set inicial sugerido de categorías (DESIGN.md, sección 3, caso 7): arranca
// vacío para cada usuario nuevo y queda completamente editable después.
const DEFAULT_CATEGORIES = [
  { name: "Vivienda", kind: "expense" as const },
  { name: "Comida", kind: "expense" as const },
  { name: "Transporte", kind: "expense" as const },
  { name: "Deudas/Cuotas", kind: "expense" as const },
  { name: "Otros", kind: "expense" as const },
  { name: "Salario", kind: "income" as const },
  { name: "Arriendo recibido", kind: "income" as const },
  { name: "Ingresos ocasionales", kind: "income" as const },
];

// upsert + ignoreDuplicates (respaldado por el unique constraint de la
// migración 20260826010000) en vez de insert: dos requests concurrentes en
// el primer login (frecuente con el prefetch de Next.js) pueden ver ambas
// "0 categorías" y llamar esto al mismo tiempo — sin esto, duplicaban el set
// completo de categorías/cuentas por defecto.
export async function ensureDefaultCategories(supabase: SupabaseClient) {
  await supabase
    .from("categories")
    .upsert(DEFAULT_CATEGORIES, {
      onConflict: "user_id,name,kind",
      ignoreDuplicates: true,
    });
}

export async function ensureDefaultAccount(supabase: SupabaseClient) {
  await supabase.from("accounts").upsert(
    { name: "Efectivo", type: "efectivo", initial_balance: 0 },
    { onConflict: "user_id,name", ignoreDuplicates: true }
  );
}
