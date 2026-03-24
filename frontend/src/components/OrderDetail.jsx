function formatCurrency(cents) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export function OrderDetail({ order, isLoading }) {
  if (isLoading) {
    return <p className="panel-message">Loading order details...</p>;
  }

  if (!order) {
    return <p className="panel-message">Select an order to view details.</p>;
  }

  return (
    <section aria-label="Order detail">
      <header className="order-detail-header">
        <h2>Order #{order.orderNumber}</h2>
        <span className="status-pill">{order.status}</span>
      </header>
      <p className="order-detail-date">Date: {order.orderDate}</p>

      <ul className="item-list">
        {order.items.map((item) => (
          <li key={item.id} className="item-row">
            <div>
              <strong>{item.productName}</strong>
              <p>
                {item.quantity} × {formatCurrency(item.unitPriceCents)}
              </p>
            </div>
            <span>{formatCurrency(item.quantity * item.unitPriceCents)}</span>
          </li>
        ))}
      </ul>

      <footer className="order-total">
        Total: <strong>{formatCurrency(order.totalCents)}</strong>
      </footer>
    </section>
  );
}
