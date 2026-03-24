export async function fetchOrderHistory() {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/orders`);

  if (!response.ok) {
    throw new Error(`Failed to fetch order history (${response.status})`);
  }

  const payload = await response.json();
  return payload.data;
}

export async function fetchOrderDetail(orderId) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/api/orders/${orderId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch order ${orderId} (${response.status})`);
  }

  const payload = await response.json();
  return payload.data;
}
