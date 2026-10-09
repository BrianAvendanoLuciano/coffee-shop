import { memo } from 'react';
import { formatMoney } from '@/lib/pricing';
import { Product } from '@/types/common';
import ButtonCircle from '../button/circle-button';

type OrderItemProp = {
  product: Product;
  handleSelectedProduct: (product: Product) => void;
};

function OrderItem({ product, handleSelectedProduct }: OrderItemProp) {
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const hasSizes = product.variants.length > 1;

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <img
        src={product.imageUrl}
        alt=""
        className="aspect-4/3 w-full object-cover"
      />
      <div className="p-4">
        <h3 className="font-medium text-slate-800">{product.name}</h3>
        <p className="mt-1 text-xs text-slate-500">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-semibold text-slate-800">
            {hasSizes && (
              <span className="text-xs font-normal text-slate-500">from </span>
            )}
            {formatMoney(lowestPrice)}
          </span>
          <ButtonCircle
            aria-label={`Add ${product.name} to order`}
            onClick={() => handleSelectedProduct(product)}
          >
            +
          </ButtonCircle>
        </div>
      </div>
    </article>
  );
}

// React.memo skips re-rendering when the props are the same as last time.
// The grid's parent re-renders on every keystroke in the search box; with
// memo, the cards do not. It only works because both props keep a stable
// identity: `product` comes from the query cache (structurally shared) and
// the handler is wrapped in useCallback by the parent.
export default memo(OrderItem);
