import { Product } from '@/types/common';
import ButtonCircle from '../button/circle-button';

type OrderItemProp = {
  product: Product;
  handleSelectedProduct: (product: Product) => void;
};

export default function OrderItem({
  product,
  handleSelectedProduct,
}: OrderItemProp) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <img
        src="/expresso.jpg"
        alt="Product Picture"
        className="aspect-4/3 w-full object-cover"
      />
      <div id="item-description" className="p-4">
        <h3 className="font-medium text-slate-800">{product.name}</h3>
        <p className="mt-1 text-xs text-slate-500">{product.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-semibold text-slate-800">$4.00</span>
          <ButtonCircle onClick={() => handleSelectedProduct(product)}>
            +
          </ButtonCircle>
        </div>
      </div>
    </div>
  );
}
