-- Segundo corte de saldo disponible (26 ago 2026): Juan empieza a usar la
-- app en serio desde hoy, y todo lo registrado hasta ahora (transacciones de
-- prueba mientras se construía la app, más los préstamos pedidos entre el 21
-- y el 26 de agosto) ya está gastado en la práctica. Ver
-- 20260821010000_debt_movements_balance_cutoff.sql para el mismo criterio
-- aplicado la primera vez.
--
-- Igual que con debt_movements: las transacciones y los préstamos NO se
-- borran (siguen apareciendo en Transacciones, Deudas y Reportes con su
-- historial intacto), simplemente dejan de sumar/restar en el saldo
-- disponible. Los registros nuevos (desde hoy en adelante) sí cuentan por
-- default.

alter table transactions
  add column counts_toward_balance boolean not null default true;

update transactions
  set counts_toward_balance = false;

-- Extiende el corte anterior: los advance/payment registrados después del
-- primer corte (21 ago) también deben dejar de contar, porque ese dinero
-- también ya se gastó antes de este segundo arranque limpio.
update debt_movements
  set counts_toward_balance = false;
