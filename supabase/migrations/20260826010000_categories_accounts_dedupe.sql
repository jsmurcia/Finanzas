-- Bug: ensureDefaultCategories/ensureDefaultAccount (bootstrap.ts) seguían
-- un patrón "contar y luego insertar" sin respaldo de un unique constraint,
-- así que dos requests concurrentes en el primer login (común con el
-- prefetch de Next.js) podían ver ambas "0 categorías" e insertar el set
-- completo por duplicado. Esta migración limpia los duplicados existentes y
-- agrega el constraint que lo evita hacia adelante (bootstrap.ts ya se
-- actualizó para usar upsert + ignoreDuplicates apoyado en este constraint).

-- 1) Categories: repunta las transacciones de las filas duplicadas hacia la
--    fila superviviente de (user_id, name, kind), luego borra los duplicados.
with ranked as (
  select id, user_id, name, kind,
         row_number() over (
           partition by user_id, name, kind order by id
         ) as rn
  from categories
),
canonical as (
  select dup.id as dup_id, keep.id as keep_id
  from ranked dup
  join ranked keep
    on keep.user_id = dup.user_id
   and keep.name = dup.name
   and keep.kind = dup.kind
   and keep.rn = 1
  where dup.rn > 1
)
update transactions t
set category_id = canonical.keep_id
from canonical
where t.category_id = canonical.dup_id;

delete from categories c
using (
  select id, row_number() over (
    partition by user_id, name, kind order by id
  ) as rn
  from categories
) ranked
where c.id = ranked.id and ranked.rn > 1;

alter table categories
  add constraint categories_user_name_kind_unique unique (user_id, name, kind);

-- 2) Accounts: mismo criterio, por si la misma condición de carrera alcanzó
--    a duplicar la cuenta "Efectivo" en algún usuario.
with ranked as (
  select id, user_id, name,
         row_number() over (
           partition by user_id, name order by id
         ) as rn
  from accounts
),
canonical as (
  select dup.id as dup_id, keep.id as keep_id
  from ranked dup
  join ranked keep
    on keep.user_id = dup.user_id
   and keep.name = dup.name
   and keep.rn = 1
  where dup.rn > 1
)
update transactions t
set account_id = canonical.keep_id
from canonical
where t.account_id = canonical.dup_id;

delete from accounts a
using (
  select id, row_number() over (
    partition by user_id, name order by id
  ) as rn
  from accounts
) ranked
where a.id = ranked.id and ranked.rn > 1;

alter table accounts
  add constraint accounts_user_name_unique unique (user_id, name);
