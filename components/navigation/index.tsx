'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 rounded-md bg-stone-800 px-3 py-2 text-white md:hidden"
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-64 flex-col bg-stone-900 text-white transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-stone-700 px-6">
          <h1 className="text-xl font-bold">Coffee Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          <Link
            href="/dashboard"
            className="block rounded-lg px-4 py-2 text-stone-300 hover:bg-stone-800 hover:text-white"
          >
            Dashboard
          </Link>

          <Link
            href="/orders"
            className="block rounded-lg px-4 py-2 text-stone-300 hover:bg-stone-800 hover:text-white"
          >
            Orders
          </Link>

          <Link
            href="/products"
            className="block rounded-lg px-4 py-2 text-stone-300 hover:bg-stone-800 hover:text-white"
          >
            Products
          </Link>

          <Link
            href="/settings"
            className="block rounded-lg px-4 py-2 text-stone-300 hover:bg-stone-800 hover:text-white"
          >
            Settings
          </Link>
        </nav>

        {/* Footer */}
        <div className="border-t border-stone-700 p-4">
          <button className="w-full rounded-lg px-4 py-2 text-left text-stone-300 hover:bg-stone-800 hover:text-white">
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}