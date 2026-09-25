"use client";

import { useId, useState } from "react";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  disabled?: boolean;
};

export function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  disabled = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <label className="block space-y-1.5 text-sm text-ink" htmlFor={inputId}>
      <span>{label}</span>
      <div className="relative">
        <input
          id={inputId}
          required
          disabled={disabled}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field pr-16"
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-[6px] px-2 py-1 text-xs font-medium text-body"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}
