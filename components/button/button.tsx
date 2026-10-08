import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button({ children, ...props }: Props) {
  return (
    <button
      {...props}
      className="w-full rounded-md bg-amber-600 py-2.5 font-medium text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2  cursor-pointer"
    >
      {children}
    </button>
  );
}
