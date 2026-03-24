import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { OrderLandingPage } from './OrderLandingPage';

afterEach(() => {
  cleanup();
});

const orderHistory = [
  {
    id: 'ord-1002',
    orderNumber: '1002',
    orderDate: '2026-03-18',
    status: 'Shipped',
    totalCents: 7300,
  },
  {
    id: 'ord-1001',
    orderNumber: '1001',
    orderDate: '2026-03-20',
    status: 'Delivered',
    totalCents: 9950,
  },
  {
    id: 'ord-1003',
    orderNumber: '1003',
    orderDate: '2026-03-14',
    status: 'Processing',
    totalCents: 15600,
  },
];

const orderDetailsById = {
  'ord-1001': {
    id: 'ord-1001',
    orderNumber: '1001',
    orderDate: '2026-03-20',
    status: 'Delivered',
    totalCents: 9950,
    items: [{ id: 1, productName: 'Notebook', quantity: 1, unitPriceCents: 9950 }],
  },
  'ord-1002': {
    id: 'ord-1002',
    orderNumber: '1002',
    orderDate: '2026-03-18',
    status: 'Shipped',
    totalCents: 7300,
    items: [{ id: 2, productName: 'Wireless Mouse', quantity: 1, unitPriceCents: 7300 }],
  },
  'ord-1003': {
    id: 'ord-1003',
    orderNumber: '1003',
    orderDate: '2026-03-14',
    status: 'Processing',
    totalCents: 15600,
    items: [{ id: 3, productName: 'Mechanical Keyboard', quantity: 1, unitPriceCents: 15600 }],
  },
};

test('renders all orders in sortable landing grid', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue(orderHistory);
  const fetchOrderDetail = vi.fn().mockResolvedValue(orderDetailsById['ord-1001']);

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  expect(await screen.findByRole('table')).toBeTruthy();
  expect(screen.getByText('ord-1001')).toBeTruthy();
  expect(screen.getByText('ord-1002')).toBeTruthy();
  expect(screen.getByText('ord-1003')).toBeTruthy();
});

test('sorts rows when sortable headers are clicked', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue(orderHistory);
  const fetchOrderDetail = vi.fn();

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  await screen.findByRole('table');

  const orderIdButtons = () => screen.getAllByRole('button', { name: /ord-\d+/ });

  expect(orderIdButtons().map((button) => button.textContent)).toEqual(['ord-1001', 'ord-1002', 'ord-1003']);

  fireEvent.click(screen.getByRole('button', { name: 'Sort by Total' }));
  expect(orderIdButtons().map((button) => button.textContent)).toEqual(['ord-1002', 'ord-1001', 'ord-1003']);

  fireEvent.click(screen.getByRole('button', { name: 'Sort by Total' }));
  expect(orderIdButtons().map((button) => button.textContent)).toEqual(['ord-1003', 'ord-1001', 'ord-1002']);
});

test('clicking order id opens order details panel', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue(orderHistory);
  const fetchOrderDetail = vi.fn((orderId) => Promise.resolve(orderDetailsById[orderId]));

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  await screen.findByRole('table');
  fireEvent.click(screen.getByRole('button', { name: 'ord-1003' }));

  await waitFor(() => {
    expect(fetchOrderDetail).toHaveBeenCalledWith('ord-1003');
  });

  expect(await screen.findByText('Order #1003')).toBeTruthy();
  expect(screen.getByText('Mechanical Keyboard')).toBeTruthy();
});

test('shows error state when order history fails', async () => {
  const fetchOrderHistory = vi.fn().mockRejectedValue(new Error('Failed to fetch order history (500)'));
  const fetchOrderDetail = vi.fn();

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  expect(await screen.findByText('Failed to fetch order history (500)')).toBeTruthy();
  expect(screen.getByText('Order details unavailable while order history failed to load.')).toBeTruthy();
});

test('shows empty state when no orders exist', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue([]);
  const fetchOrderDetail = vi.fn();

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  expect(await screen.findByText('No orders found.')).toBeTruthy();
  expect(screen.getByText('Select an order to view details.')).toBeTruthy();
});
