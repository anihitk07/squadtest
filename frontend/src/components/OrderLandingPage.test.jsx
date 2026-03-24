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

const largeOrderHistory = Array.from({ length: 11 }, (_, i) => ({
  id: `ord-${2000 + i}`,
  orderNumber: `${2000 + i}`,
  orderDate: `2026-03-${String(i + 1).padStart(2, '0')}`,
  status: i % 2 === 0 ? 'Delivered' : 'Shipped',
  totalCents: (i + 1) * 1000,
}));

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

test('live search filters orders by status', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue(orderHistory);
  const fetchOrderDetail = vi.fn();

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  await screen.findByRole('table');

  const searchInput = screen.getByRole('searchbox', { name: 'Search orders' });
  fireEvent.change(searchInput, { target: { value: 'delivered' } });

  expect(screen.getByText('ord-1001')).toBeTruthy();
  expect(screen.queryByText('ord-1002')).toBeNull();
  expect(screen.queryByText('ord-1003')).toBeNull();
});

test('live search filters orders by order id', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue(orderHistory);
  const fetchOrderDetail = vi.fn();

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  await screen.findByRole('table');

  const searchInput = screen.getByRole('searchbox', { name: 'Search orders' });
  fireEvent.change(searchInput, { target: { value: 'ord-1003' } });

  expect(screen.queryByText('ord-1001')).toBeNull();
  expect(screen.queryByText('ord-1002')).toBeNull();
  expect(screen.getByText('ord-1003')).toBeTruthy();
});

test('live search with no matches shows empty row', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue(orderHistory);
  const fetchOrderDetail = vi.fn();

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  await screen.findByRole('table');

  const searchInput = screen.getByRole('searchbox', { name: 'Search orders' });
  fireEvent.change(searchInput, { target: { value: 'zzznomatch' } });

  expect(screen.getByText('No orders match your search.')).toBeTruthy();
});

test('pagination shows first page and navigates to next page', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue(largeOrderHistory);
  const fetchOrderDetail = vi.fn();

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  await screen.findByRole('table');

  expect(screen.getByText('Page 1 of 3')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Previous page' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Next page' })).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByText('Page 2 of 3')).toBeTruthy();
});

test('prev page button is disabled on first page and next is disabled on last page', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue(largeOrderHistory);
  const fetchOrderDetail = vi.fn();

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  await screen.findByRole('table');

  expect(screen.getByRole('button', { name: 'Previous page' }).disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Next page' }).disabled).toBe(false);

  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

  expect(screen.getByText('Page 3 of 3')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Next page' }).disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Previous page' }).disabled).toBe(false);
});

test('pagination resets to page 1 when search query changes', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue(largeOrderHistory);
  const fetchOrderDetail = vi.fn();

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  await screen.findByRole('table');

  fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
  expect(screen.getByText('Page 2 of 3')).toBeTruthy();

  const searchInput = screen.getByRole('searchbox', { name: 'Search orders' });
  fireEvent.change(searchInput, { target: { value: 'delivered' } });

  expect(screen.getByText('Page 1 of 2')).toBeTruthy();
});

test('pagination is hidden when all orders fit on one page', async () => {
  const fetchOrderHistory = vi.fn().mockResolvedValue(orderHistory);
  const fetchOrderDetail = vi.fn();

  render(<OrderLandingPage fetchOrderHistory={fetchOrderHistory} fetchOrderDetail={fetchOrderDetail} />);

  await screen.findByRole('table');

  expect(screen.queryByRole('button', { name: 'Previous page' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull();
});
