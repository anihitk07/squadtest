import { afterEach, expect, test, vi } from 'vitest';
import { fetchOrderDetail, fetchOrderHistory } from './ordersApi';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('fetchOrderHistory returns data payload when request succeeds', async () => {
  const orders = [{ id: 'ord-1' }, { id: 'ord-2' }];
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: orders }),
    }),
  );

  const data = await fetchOrderHistory();

  expect(data).toEqual(orders);
  expect(globalThis.fetch).toHaveBeenCalledWith('/api/orders');
});

test('fetchOrderHistory throws status-aware error on non-OK response', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Service unavailable' }),
    }),
  );

  await expect(fetchOrderHistory()).rejects.toMatchObject({
    message: 'Failed to fetch order history (503)',
  });
});

test('fetchOrderDetail returns detail payload and targets selected id path', async () => {
  const detail = { id: 'ord-7', items: [{ id: 1 }] };
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: detail }),
    }),
  );

  const data = await fetchOrderDetail('ord-7');

  expect(data).toEqual(detail);
  expect(globalThis.fetch).toHaveBeenCalledWith('/api/orders/ord-7');
});

test('fetchOrderDetail throws deterministic error for failed request', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Order not found' }),
    }),
  );

  await expect(fetchOrderDetail('ord-404')).rejects.toMatchObject({
    message: 'Failed to fetch order ord-404 (404)',
  });
});
