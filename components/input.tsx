import { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

export default function Input({ name, label, ...props }: Props) {
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
        className="w-full rounded-md border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
        placeholder={props?.placeholder}
        {...props}
      />
    </>
  );
}
