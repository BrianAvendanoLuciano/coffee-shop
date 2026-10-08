import React from 'react';

interface Props {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: Props) {
  return <div className="mx-auto max-w-7xl p-6 text-slate-800">{children}</div>;
}
