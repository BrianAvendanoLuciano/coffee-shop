'use client';
import { usePathname } from 'next/navigation';

export default function CategoryPage() {
  const path = usePathname();
  console.log(path);
  return (
    <div>
      <h1>Category Page</h1>
    </div>
  );
}
