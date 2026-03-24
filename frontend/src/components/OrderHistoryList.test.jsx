import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OrderHistoryList } from './OrderHistoryList';

afterEach(() => {
  cleanup();
});

const sampleOrders = [
  {
    id: 'ord-1001',
    orderNumber: '1001',
    orderDate: '2026-03-20',
    status: 'Delivered',
    totalCents: 9950,
  },
  {
    id: 'ord-1002',
    orderNumber: '1002',
    orderDate: '2026-03-18',
    status: 'Processing',
    totalCents: 7300,
  },
];

test('shows loading state while history is being fetched', () => {
  render(
    <OrderHistoryList
      isLoading
      orders={[]}
      selectedOrderId={null}
      onSelectOrder={() => {}}
    />,
  );

  expect(screen.getByText('Loading order history...')).toBeTruthy();
});

test('shows empty state when no orders are available', () => {
  render(
    <OrderHistoryList
      isLoading={false}
      orders={[]}
      selectedOrderId={null}
      onSelectOrder={() => {}}
    />,
  );

  expect(screen.getByText('No orders found.')).toBeTruthy();
});

test('renders rows, highlights active order, and emits selection callback', () => {
  const onSelectOrder = vi.fn();

  render(
    <OrderHistoryList
      isLoading={false}
      orders={sampleOrders}
      selectedOrderId="ord-1002"
      onSelectOrder={onSelectOrder}
    />,
  );

  expect(screen.getByLabelText('Order history list')).toBeTruthy();
  expect(screen.getByText('#1001')).toBeTruthy();
  expect(screen.getByText('#1002')).toBeTruthy();
  expect(screen.getByText('$99.50')).toBeTruthy();
  expect(screen.getByText('$73.00')).toBeTruthy();

  const buttons = screen.getAllByRole('button');
  expect(buttons[0].className.includes('is-active')).toBe(false);
  expect(buttons[1].className.includes('is-active')).toBe(true);

  fireEvent.click(screen.getByRole('button', { name: /#1001/i }));
  expect(onSelectOrder).toHaveBeenCalledWith('ord-1001');
});
