import { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  error?: string;
}

export default function Input({ name, label, error, ...props }: Props) {
  const errorId = `${name}-error`;

  return (
    <>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 text-slate-900 font-medium text-sm inline-block "
        >
          {label}
        </label>
      )}

      <input
        id={name}
        name={name}
        type="text"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-md border bg-white px-3 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:ring-2 ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-stone-200 focus:border-amber-500 focus:ring-amber-500/20'
        }`}
        {...props}
      />

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </>
  );
}
