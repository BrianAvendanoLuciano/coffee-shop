import { OrderItems } from '@/types/common';
import ButtonCircle from '../button/circle-button';

interface OrderCartItemProps {
  order: OrderItems;
}

export default function OrderCartItem({ order }: OrderCartItemProps) {
  console.log('order', order);
  return (
    <div className="border-b border-slate-200 p-2 my-2">
      <span className="flex justify-between items-center">
        <p>{order?.productName}</p>
        <p>{order?.subtotal}</p>
      </span>

      <span className="flex gap-2 mt-2">
        <ButtonCircle>-</ButtonCircle>
        <p className="flex justify-center items-center">1</p>
        <ButtonCircle>+</ButtonCircle>
      </span>
    </div>
  );
}
