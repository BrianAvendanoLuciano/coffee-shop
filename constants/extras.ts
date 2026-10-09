import type { Extra } from '@/types/common';

// `as const` keeps the literal types; `satisfies` checks the shape against
// Extra[] without widening them away, so ExtraId below is a precise union.
export const EXTRAS = [
  { id: 'extra-shot', name: 'Extra espresso shot', price: 30 },
  { id: 'oat-milk', name: 'Oat milk', price: 25 },
  { id: 'vanilla-syrup', name: 'Vanilla syrup', price: 15 },
] as const satisfies readonly Extra[];

export type ExtraId = (typeof EXTRAS)[number]['id'];
