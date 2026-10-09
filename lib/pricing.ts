import type { Extra } from '@/types/common';

export const TAX_RATE = 0.12;

// Pure functions shared by the cart (client) and the order service (server).
// The server recomputes everything and never trusts a price sent by a browser.

export function unitPrice(
  variantPrice: number,
  extras: readonly Pick<Extra, 'price'>[],
): number {
  return variantPrice + extras.reduce((sum, extra) => sum + extra.price, 0);
}

export function totals(
  lines: readonly { unitPrice: number; quantity: number }[],
) {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  return { subtotal, tax, total: subtotal + tax };
}

const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
});

export function formatMoney(amount: number): string {
  return peso.format(amount);
}
