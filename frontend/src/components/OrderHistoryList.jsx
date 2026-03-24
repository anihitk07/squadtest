function formatCurrency(cents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function OrderHistoryList({ orders, selectedOrderId, onSelectOrder, isLoading }) {
  if (isLoading) {
    return <p className="panel-message">Loading order history...</p>;
  }

  if (orders.length === 0) {
    return <p className="panel-message">No orders found.</p>;
  }

  return (
    <ul className="order-list" aria-label="Order history list">
      {orders.map((order) => {
        const isActive = selectedOrderId === order.id;

        return (
          <li key={order.id}>
            <button
              className={`order-row ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelectOrder(order.id)}
              type="button"
            >
              <div>
                <strong>#{order.orderNumber}</strong>
                <p>{order.orderDate}</p>
              </div>
              <div className="order-row-meta">
                <span>{order.status}</span>
                <span>{formatCurrency(order.totalCents)}</span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
