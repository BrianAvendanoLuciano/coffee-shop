import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
}

export default function ButtonCircle({
  children,
  color = 'bg-amber-500 text-white hover:bg-amber-600',
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`${color} font-semibold rounded-full h-9 w-9 p-3 flex justify-center items-center cursor-pointer`}
    >
      {children}
    </button>
  );
}
