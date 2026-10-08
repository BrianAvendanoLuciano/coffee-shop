'use client';

import ButtonCircle from '@/components/button/circle-button';
import ContentWrapper from '@/components/dashboard/main-content-wrapper';
import Modal from '@/components/modal';
import OrderItem from '@/components/order/item';
import OrderCartItem from '@/components/order/order-cart-item';
import { products } from '@/constants/products';
import { OrderItems, Product, ProductVariant } from '@/types/common';
import { ModalHandle } from '@/types/ui';
import { useRef, useState } from 'react';

const cartItems = [
  { ...products[0] },
  { ...products[2] },
  { ...products[3] },
  { ...products[5] },
];

const extras = ['Sugar', 'Milk', 'Expresso'];

export default function OrderPage() {
  const modalRef = useRef<ModalHandle>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [cartItems, setCartItems] = useState<OrderItems[]>([]);

  const handleSelectedProduct = (product: Product) => {
    console.log(product);
    setSelectedProduct(product);
    modalRef.current?.open();
  };

  const handleUnselectProduct = () => setSelectedProduct(null);

  const handleAddOrder = () => {
    if (!selectedProduct || !selectedVariant) {
      return;
    }
    console.log('selectedProduct', selectedProduct);
    const orderItem: OrderItems = {
      id: crypto.randomUUID(),
      orderId: '',

      productId: selectedProduct.id,
      productVariantId: selectedVariant.id,

      productName: selectedProduct.name,
      size: selectedVariant.size,
      unitPrice: selectedVariant.price,
      subtotal: selectedVariant.price * 1,

      createdAt: new Date().toISOString(),
    };

    setCartItems((prev) => [...prev, orderItem]);

    setSelectedProduct(null);
    setSelectedVariant(null);
  };
  return (
    <ContentWrapper>
      <h1 className="text-2xl font-semibold">Order</h1>
      <p className="">Choose something to enjoy.</p>

      <div className="flex justify-between mt-4">
        <ul id="order-category-tabs" className="flex gap-1">
          <li>
            <button className="w-24 p-2 rounded-3xl text-slate-600 hover:bg-amber-500 hover:text-white cursor-pointer">
              All
            </button>
          </li>
          <li>
            <button className="w-24 p-2 rounded-3xl text-slate-600 hover:bg-amber-500 hover:text-white cursor-pointer">
              Coffee
            </button>
          </li>
          <li>
            <button className="w-24 p-2 rounded-3xl text-slate-600 hover:bg-amber-500 hover:text-white cursor-pointer">
              Tea
            </button>
          </li>
          <li>
            <button className="w-24 p-2 rounded-3xl text-slate-600 hover:bg-amber-500 hover:text-white cursor-pointer">
              Pastries
            </button>
          </li>
          <li>
            <button className="w-24 p-2 rounded-3xl text-slate-600 hover:bg-amber-500 hover:text-white cursor-pointer">
              Desserts
            </button>
          </li>
        </ul>
        <div>
          <input
            className="text-sm mr-10 w-full p-2"
            placeholder="Search coffee, tea, pastries..."
          />
        </div>
      </div>
      <hr className="w-full border-b border-slate-200" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((item) => (
            <OrderItem
              key={item.id}
              product={item}
              handleSelectedProduct={handleSelectedProduct}
            />
          ))}
        </section>
        <aside className="sticky top-6 h-fit mt-6">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h1 className="text-2xl font-semibold">Order Summary</h1>
            <section id="cart-list">
              {cartItems?.map((cartItem) => (
                <OrderCartItem key={`cart-${cartItem.id}`} order={cartItem} />
              ))}
            </section>
            <section id="cart-price-section w-full">
              <div className="flex justify-between my-4">
                <p className="text-xl">Total</p> <p>$4</p>
              </div>
              <button className="bg-amber-500 w-full rounded-2xl p-2 text-white cursor-pointer hover:bg-amber-600">
                Place Order
              </button>
            </section>
          </div>
        </aside>
      </div>
      <Modal open={selectedProduct !== null} onClose={handleUnselectProduct}>
        <header className="flex justify-between items-center p-2">
          <p className="text-2xl font-semibold text-slate-800">
            Add {selectedProduct?.name}
          </p>
          <ButtonCircle
            onClick={handleUnselectProduct}
            aria-label="Close"
            reverse={true}
          >
            X
          </ButtonCircle>
        </header>
        <hr className="w-full border-b border-slate-200" />
        <div className="my-4">
          {selectedProduct?.variants.length && (
            <fieldset className="my-4">
              <legend className="font-semibold mb-2">Size</legend>
              <div className="grid grid-cols-3 gap-2">
                {selectedProduct?.variants.map((variant) => (
                  <label
                    className={`
                      px-3 py-2 flex flex-col border
                      rounded-2xl shadow-md cursor-pointer 
                      ${selectedVariant?.id === variant.id ? 'bg-amber-200 text-amber-800 border-amber-800' : 'border-slate-200 '}
                      hover:bg-amber-200 hover:text-amber-800 hover:border-amber-800  
                    `}
                    key={variant.id}
                  >
                    <span className="flex justify-between gap-2 items-center text-sm">
                      <span>{variant.size}</span>
                      <input
                        type="radio"
                        name="size"
                        className="accent-amber-600 h-4 w-4"
                        value={variant.id}
                        onChange={(e) => setSelectedVariant(variant)}
                      />
                    </span>
                    <span className="font-semibold">₱{variant.price}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div>
            <label className="font-semibold">Quantity</label>
            <div className="flex justify-center gap-4 items-center mt-2">
              <ButtonCircle>-</ButtonCircle>

              <span>1</span>
              <ButtonCircle>+</ButtonCircle>
            </div>
          </div>
          <div>
            <label className="font-semibold">Extra</label>
            <div className="flex flex-col gap-2 mt-2">
              {extras.map((extra) => (
                <label
                  className={`
                  px-3 py-2 flex border w-full
                  justify-between items-center 
                  rounded-2xl shadow-md cursor-pointer 
                  'bg-amber-200 text-amber-800 border-amber-800'
                  hover:bg-amber-200 hover:text-amber-800 hover:border-amber-800  
                `}
                >
                  <input
                    type="checkbox"
                    name="size"
                    className="accent-amber-600 h-4 w-4"
                    value="sugar"
                  />
                  <span>{extra}</span>

                  <span className="font-semibold text-center">₱0</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <hr className="w-full border-b border-slate-200" />
        <footer className="my-4 flex justify-between items-center">
          <span className="font-semibold">
            <p>Total:</p>
            <p>₱120</p>
          </span>
          <button
            onClick={handleAddOrder}
            type="button"
            className="bg-amber-500 p-4 text-sm text-white cursor-pointer rounded-xl hover:bg-amber-600"
          >
            Add to Order
          </button>
        </footer>
      </Modal>
    </ContentWrapper>
  );
}
