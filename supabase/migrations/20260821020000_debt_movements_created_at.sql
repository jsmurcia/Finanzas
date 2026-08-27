-- `occurred_on` es solo fecha (sin hora), y en uso real casi todos los
-- movimientos de un mismo día quedan con la misma fecha. Sin una columna de
-- hora real de creación, el ORDER BY occurred_on desc no tiene desempate
-- confiable, así que Postgres puede devolver los movimientos más viejos
-- antes que uno recién registrado — por eso un abono nuevo podía no
-- aparecer en "Movimientos recientes" aunque acabara de guardarse.

alter table debt_movements
  add column created_at timestamptz not null default now();
