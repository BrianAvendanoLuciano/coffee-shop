import type { CategoryId } from '@/types/common';

// Record<K, V> requires an entry for every category: adding one to the schema
// without labelling it here is a compile error.
export const CATEGORY_LABELS: Record<CategoryId, string> = {
  'cat-coffee': 'Coffee',
  'cat-tea': 'Tea',
  'cat-pastries': 'Pastries',
  'cat-desserts': 'Desserts',
};

export type CategoryFilter = CategoryId | 'all';

export const CATEGORY_TABS: ReadonlyArray<{
  id: CategoryFilter;
  label: string;
}> = [
  { id: 'all', label: 'All' },
  ...(Object.keys(CATEGORY_LABELS) as CategoryId[]).map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
  })),
];

export function isCategoryId(value: string | null): value is CategoryId {
  return value !== null && value in CATEGORY_LABELS;
}
