import { EXTRAS } from '@/constants/extras';
import { formatMoney } from '@/lib/pricing';
import { itemRemoved, quantityChanged } from '@/store/cart-slice';
import { useAppDispatch } from '@/store/hooks';
import { CartLine } from '@/types/common';
import ButtonCircle from '../button/circle-button';

interface OrderCartItemProps {
  line: CartLine;
}

export default function OrderCartItem({ line }: OrderCartItemProps) {
  const dispatch = useAppDispatch();

  const extras = EXTRAS.filter((extra) => line.extraIds.includes(extra.id));
  const details = [
    line.size === 'REGULAR' ? null : line.size.toLowerCase(),
    ...extras.map((extra) => extra.name.toLowerCase()),
  ].filter((part) => part !== null);

  const changeQuantity = (quantity: number) =>
    dispatch(quantityChanged({ id: line.id, quantity }));

  return (
    <li className="border-b border-slate-200 p-2 my-2">
      <span className="flex justify-between items-center">
        <p>{line.productName}</p>
        <p>{formatMoney(line.unitPrice * line.quantity)}</p>
      </span>
      {details.length > 0 && (
        <p className="text-xs text-slate-500">{details.join(', ')}</p>
      )}

      <span className="flex items-center gap-2 mt-2">
        <ButtonCircle
          aria-label={`Remove one ${line.productName}`}
          onClick={() => changeQuantity(line.quantity - 1)}
        >
          -
        </ButtonCircle>
        <p className="w-6 text-center" aria-live="polite">
          {line.quantity}
        </p>
        <ButtonCircle
          aria-label={`Add one ${line.productName}`}
          onClick={() => changeQuantity(line.quantity + 1)}
        >
          +
        </ButtonCircle>
        <button
          type="button"
          onClick={() => dispatch(itemRemoved(line.id))}
          className="ml-auto cursor-pointer text-xs text-slate-500 underline hover:text-red-600"
        >
          Remove
        </button>
      </span>
    </li>
  );
}
