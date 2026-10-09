'use client';

import { type SubmitEvent, useId, useMemo, useState } from 'react';
import ButtonCircle from '@/components/button/circle-button';
import Modal from '@/components/modal';
import { EXTRAS } from '@/constants/extras';
import { useToast } from '@/context/toast-context';
import { formatMoney, unitPrice } from '@/lib/pricing';
import { itemAdded } from '@/store/cart-slice';
import { useAppDispatch } from '@/store/hooks';
import type { Product } from '@/types/common';

type Props = {
  product: Product;
  onClose: () => void;
};

const MAX_QUANTITY = 20;

// The form state here is local on purpose. Nothing outside this dialog cares
// which size is ticked until "Add to Order" is pressed; only then does the
// result go into the global store.
export default function CustomizeDialog({ product, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { notify } = useToast();
  const titleId = useId();

  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [extraIds, setExtraIds] = useState<string[]>([]);

  // Derived values are computed during render, not stored in state: state
  // that can be calculated from other state can only ever get out of sync.
  const variant = product.variants.find((v) => v.id === variantId);

  // useMemo caches a calculation between renders. This one is cheap, so the
  // win is small; the pattern matters when the work is heavy.
  const total = useMemo(() => {
    const extras = EXTRAS.filter((extra) => extraIds.includes(extra.id));
    return unitPrice(variant?.price ?? 0, extras) * quantity;
  }, [variant, extraIds, quantity]);

  const toggleExtra = (id: string, checked: boolean) => {
    // Never mutate state in place: build a new array so React sees a change.
    setExtraIds((current) =>
      checked ? [...current, id] : current.filter((extraId) => extraId !== id),
    );
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!variant) return;

    dispatch(itemAdded(product, variant, extraIds, quantity));
    notify('success', `${quantity} × ${product.name} added.`);
    onClose();
  };

  return (
    <Modal open onClose={onClose} labelledBy={titleId}>
      <form onSubmit={handleSubmit}>
        <header className="flex justify-between items-center p-2">
          <h2 id={titleId} className="text-2xl font-semibold text-slate-800">
            Add {product.name}
          </h2>
          <ButtonCircle type="button" onClick={onClose} aria-label="Close">
            X
          </ButtonCircle>
        </header>
        <hr className="w-full border-b border-slate-200" />

        <div className="my-4 space-y-4">
          {product.variants.length > 1 && (
            <fieldset>
              <legend className="font-semibold mb-2">Size</legend>
              <div className="grid grid-cols-3 gap-2">
                {product.variants.map((option) => (
                  <label
                    key={option.id}
                    className={`
                      px-3 py-2 flex flex-col border
                      rounded-2xl shadow-md cursor-pointer
                      ${option.id === variantId ? 'bg-amber-200 text-amber-800 border-amber-800' : 'border-slate-200'}
                      hover:bg-amber-200 hover:text-amber-800 hover:border-amber-800
                    `}
                  >
                    <span className="flex justify-between gap-2 items-center text-sm">
                      <span>{option.size}</span>
                      {/* Controlled input: `checked` comes from state and
                          onChange writes back to it. React state is the
                          single source of truth, not the DOM. */}
                      <input
                        type="radio"
                        name="size"
                        className="accent-amber-600 h-4 w-4"
                        value={option.id}
                        checked={option.id === variantId}
                        onChange={() => setVariantId(option.id)}
                      />
                    </span>
                    <span className="font-semibold">
                      {formatMoney(option.price)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset>
            <legend className="font-semibold">Quantity</legend>
            <div className="flex justify-center gap-4 items-center mt-2">
              <ButtonCircle
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => q - 1)}
              >
                -
              </ButtonCircle>
              <output aria-live="polite" className="w-6 text-center">
                {quantity}
              </output>
              <ButtonCircle
                type="button"
                aria-label="Increase quantity"
                disabled={quantity >= MAX_QUANTITY}
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </ButtonCircle>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-semibold">Extras</legend>
            <div className="flex flex-col gap-2 mt-2">
              {EXTRAS.map((extra) => (
                <label
                  key={extra.id}
                  className="px-3 py-2 flex border border-slate-200 w-full justify-between items-center rounded-2xl shadow-md cursor-pointer hover:bg-amber-200 hover:text-amber-800 hover:border-amber-800"
                >
                  <input
                    type="checkbox"
                    name="extras"
                    className="accent-amber-600 h-4 w-4"
                    value={extra.id}
                    checked={extraIds.includes(extra.id)}
                    onChange={(event) =>
                      toggleExtra(extra.id, event.target.checked)
                    }
                  />
                  <span>{extra.name}</span>
                  <span className="font-semibold text-center">
                    +{formatMoney(extra.price)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <hr className="w-full border-b border-slate-200" />
        <footer className="my-4 flex justify-between items-center">
          <span className="font-semibold">
            <p>Total:</p>
            <p>{formatMoney(total)}</p>
          </span>
          <button
            type="submit"
            disabled={!variant}
            className="bg-amber-500 p-4 text-sm text-white cursor-pointer rounded-xl hover:bg-amber-600"
          >
            Add to Order
          </button>
        </footer>
      </form>
    </Modal>
  );
}
