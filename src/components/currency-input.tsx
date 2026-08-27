"use client";

import { useId, useState } from "react";
import { currency } from "@/lib/finance/format";

function toDigits(value: string) {
  return value.replace(/\D/g, "");
}

type CurrencyInputProps = {
  name: string;
  label: string;
  defaultValue?: number | string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  labelClassName?: string;
};

export function CurrencyInput({
  name,
  label,
  defaultValue,
  required,
  autoFocus,
  className,
  labelClassName,
}: CurrencyInputProps) {
  const id = useId();
  const [digits, setDigits] = useState(() =>
    defaultValue === undefined || defaultValue === ""
      ? ""
      : toDigits(String(defaultValue))
  );

  return (
    <label htmlFor={id} className={labelClassName}>
      {label}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        required={required}
        autoFocus={autoFocus}
        placeholder="$ 0"
        value={digits ? currency.format(Number(digits)) : ""}
        onChange={(event) => setDigits(toDigits(event.target.value))}
        className={className}
      />
      <input type="hidden" name={name} value={digits} />
    </label>
  );
}
