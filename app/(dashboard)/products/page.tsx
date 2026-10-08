'use client';
import { usePathname } from 'next/navigation';

export default function ProductPage() {
  const path = usePathname();
  console.log(path);
  return (
    <div>
      <h1>Product Page</h1>
    </div>
  );
}
