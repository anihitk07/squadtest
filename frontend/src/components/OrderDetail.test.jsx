import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { OrderDetail } from './OrderDetail';

afterEach(() => {
  cleanup();
});

test('shows loading message when detail request is in progress', () => {
  render(<OrderDetail order={null} isLoading />);

  expect(screen.getByText('Loading order details...')).toBeTruthy();
});

test('shows prompt when no order is selected', () => {
  render(<OrderDetail order={null} isLoading={false} />);

  expect(screen.getByText('Select an order to view details.')).toBeTruthy();
});

test('renders selected order details with item and total currency formatting', () => {
  render(
    <OrderDetail
      isLoading={false}
      order={{
        id: 'ord-2001',
        orderNumber: '2001',
        orderDate: '2026-03-24',
        status: 'Delivered',
        totalCents: 4397,
        items: [
          {
            id: 1,
            productName: 'Notebook',
            quantity: 2,
            unitPriceCents: 999,
          },
          {
            id: 2,
            productName: 'Pen Set',
            quantity: 1,
            unitPriceCents: 2399,
          },
        ],
      }}
    />,
  );

  expect(screen.getByRole('heading', { name: 'Order #2001' })).toBeTruthy();
  expect(screen.getByText('Delivered')).toBeTruthy();
  expect(screen.getByText('Date: 2026-03-24')).toBeTruthy();
  expect(screen.getByText('Notebook')).toBeTruthy();
  expect(screen.getByText('Pen Set')).toBeTruthy();
  expect(screen.getByText('2 × $9.99')).toBeTruthy();
  expect(screen.getByText('$19.98')).toBeTruthy();
  expect(screen.getByText('$23.99')).toBeTruthy();
  expect(screen.getByText('Total:')).toBeTruthy();
  expect(screen.getByText('$43.97')).toBeTruthy();
});
