'use client';

import Button from '@/components/button/button';
import ButtonCircle from '@/components/button/circle-button';
import ContentWrapper from '@/components/dashboard/main-content-wrapper';
import Modal from '@/components/modal';
import { icons } from '@/components/navigation/icons';
import OrderHistoryTable, {
  OrderHistoryDataType,
} from '@/components/order-history/table';
import { monthMapping } from '@/types/date';
import moment from 'moment';
import { useState } from 'react';

const orderHistoryData: OrderHistoryDataType = {
  columns: ['Date', 'Item', 'Employee', 'Customer', 'Status'],

  data: [
    {
      id: 'ord-001',
      orderNumber: 'ORD-20260927-001',
      employeeId: 'emp-001',
      status: 'COMPLETED',
      tax: '0.00',
      discount: '0.00',
      total: 245.0,
      createdAt: '2026-09-27T09:15:00Z',
      updatedAt: '2026-09-27T09:20:00Z',
      customer: 'Brian',
      orderItems: [
        {
          id: 'item-001',
          orderId: 'ord-001',
          productId: 'prod-001',
          productName: 'Cappuccino',
          variant: {
            id: 'var-001',
            name: 'Large',
            price: 10.0,
          },
          quantity: 2,
          unitPrice: 90.0,
          subtotal: 180.0,
          createdAt: '2026-09-27T09:15:00Z',
        },
        {
          id: 'item-002',
          orderId: 'ord-001',
          productId: 'prod-005',
          productName: 'Chocolate Croissant',
          variant: null,
          quantity: 1,
          unitPrice: 65.0,
          subtotal: 65.0,
          createdAt: '2026-09-27T09:15:00Z',
        },
      ],
    },

    {
      id: 'ord-002',
      orderNumber: 'ORD-20260927-002',
      employeeId: 'emp-002',
      status: 'COMPLETED',
      tax: '15.00',
      discount: '10.00',
      total: 320.0,
      customer: 'Crystal',
      createdAt: '2026-09-27T10:30:00Z',
      updatedAt: '2026-09-27T10:38:00Z',

      orderItems: [
        {
          id: 'item-003',
          orderId: 'ord-002',
          productId: 'prod-002',
          productName: 'Iced Latte',
          variant: {
            id: 'var-002',
            name: 'Large',
            price: 20.0,
          },
          quantity: 2,
          unitPrice: 110.0,
          subtotal: 220.0,
          createdAt: '2026-09-27T10:30:00Z',
        },
        {
          id: 'item-004',
          orderId: 'ord-002',
          productId: 'prod-007',
          productName: 'Blueberry Muffin',
          variant: {
            id: 'var-003',
            name: 'Regular',
            price: 0.0,
          },
          quantity: 2,
          unitPrice: 50.0,
          subtotal: 100.0,
          createdAt: '2026-09-27T10:30:00Z',
        },
      ],
    },

    {
      id: 'ord-003',
      orderNumber: 'ORD-20260927-003',
      employeeId: 'emp-001',
      status: 'CANCELLED',
      tax: '0.00',
      discount: '0.00',
      total: 150.0,
      customer: 'Crystal',
      createdAt: '2026-09-27T11:45:00Z',
      updatedAt: '2026-09-27T11:50:00Z',

      orderItems: [
        {
          id: 'item-005',
          orderId: 'ord-003',
          productId: 'prod-003',
          productName: 'Americano',
          variant: {
            id: 'var-004',
            name: 'Medium',
            price: 0.0,
          },
          quantity: 2,
          unitPrice: 75.0,
          subtotal: 150.0,
          createdAt: '2026-09-27T11:45:00Z',
        },
      ],
    },

    {
      id: 'ord-004',
      orderNumber: 'ORD-20260927-004',
      employeeId: 'emp-003',
      status: 'PENDING',
      tax: '20.00',
      discount: '0.00',
      total: 420.0,
      customer: 'Crystal',
      createdAt: '2026-09-27T12:10:00Z',
      updatedAt: '2026-09-27T12:10:00Z',

      orderItems: [
        {
          id: 'item-006',
          orderId: 'ord-004',
          productId: 'prod-004',
          productName: 'Caramel Macchiato',
          variant: {
            id: 'var-005',
            name: 'Large',
            price: 30.0,
          },
          quantity: 2,
          unitPrice: 130.0,
          subtotal: 260.0,
          createdAt: '2026-09-27T12:10:00Z',
        },
        {
          id: 'item-007',
          orderId: 'ord-004',
          productId: 'prod-008',
          productName: 'Chocolate Cake',
          variant: {
            id: 'var-006',
            name: 'Slice',
            price: 0.0,
          },
          quantity: 2,
          unitPrice: 80.0,
          subtotal: 160.0,
          createdAt: '2026-09-27T12:10:00Z',
        },
      ],
    },
  ],
};

export default function OrderHistoryPage() {
  const [selectedPending, setSelectedPending] = useState<String | null>(null);

  const handleSelectedPending = (id: string) => {
    setSelectedPending(id);
  };

  const today = new Date();
  const pendingOrders = orderHistoryData.data.filter(
    (order) => order.status !== '',
  );

  const dateFormat = (dateStr: string) => {
    const date = new Date(dateStr);
  };
  return (
    <ContentWrapper>
      <div className="my-4">
        <h1 className="text-2xl font-semibold">Pending Orders</h1>
        <p className="text">Let's get them their coffee</p>
      </div>
      <div className="grid grid-cols-3">
        {pendingOrders.map((history) => (
          <div className="bg-white p-4 rounded-xl m-2">
            <div className="flex justify-between mb-2">
              <p className="text-xl font-bold">{history.customer}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                  {icons.x}
                </button>
                <button
                  onClick={() => handleSelectedPending(history.id)}
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                >
                  {icons.check}
                </button>
              </div>
            </div>
            {history.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-6"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">
                      {item.productName}
                    </span>

                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                      {item.quantity}x
                    </span>
                  </div>

                  {item.variant && (
                    <p className="mt-1 text-xs text-gray-500">
                      {item.variant.name}
                      {item.variant.price > 0 && (
                        <span className="ml-1 text-amber-700">
                          +₱{item.variant.price.toFixed(2)}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <p className="whitespace-nowrap font-medium text-gray-700">
                  ₱{item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>

      <hr className="border-b border-slate-200 my-6" />
      <div className="my-4">
        <h1 className="text-2xl font-semibold">Recent Orders</h1>
        <p className="text">Today</p>
      </div>
      <OrderHistoryTable
        data={orderHistoryData.data}
        columns={orderHistoryData.columns}
      />
      <Modal
        open={selectedPending !== null}
        onClose={() => setSelectedPending(null)}
      >
        <div>
          <header className="flex justify-between">
            <p className="text-xl">Order Complete</p>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              {icons.x}
            </button>
          </header>
          <p className="my-10">Are you sure the order is complete?</p>
          <footer>
            <Button>Order Complete</Button>
          </footer>
        </div>
      </Modal>
    </ContentWrapper>
  );
}
