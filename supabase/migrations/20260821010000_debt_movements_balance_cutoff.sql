-- Corte para las deudas que ya existían antes del saldo disponible único
-- (DESIGN.md, sección 4.1, "Corte para las deudas que ya existían").
-- El dinero de los debt_movements registrados antes de este cambio ya se
-- gastó sin que la app llevara cuenta de eso en el saldo disponible, así
-- que no deben volver a sumar/restar ahora que la fórmula los incluye.
-- Los movimientos nuevos (Pedir más / Abonar) sí cuentan por default.
-- debts.current_balance no se toca: sigue siendo plata que se debe, sin
-- importar si el movimiento cuenta o no para el saldo disponible.

alter table debt_movements
  add column counts_toward_balance boolean not null default true;

update debt_movements
  set counts_toward_balance = false;
