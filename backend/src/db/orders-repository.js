const { getDb } = require('./client');

function listOrders() {
  const db = getDb();

  return db
    .prepare(`
      SELECT
        id,
        order_number AS orderNumber,
        order_date AS orderDate,
        status,
        total_cents AS totalCents
      FROM orders
      ORDER BY order_date DESC;
    `)
    .all();
}

function getOrderById(orderId) {
  const db = getDb();
  const order = db
    .prepare(`
      SELECT
        id,
        order_number AS orderNumber,
        order_date AS orderDate,
        status,
        total_cents AS totalCents
      FROM orders
      WHERE id = ?;
    `)
    .get(orderId);

  if (!order) {
    return null;
  }

  const items = db
    .prepare(`
      SELECT
        id,
        product_name AS productName,
        quantity,
        unit_price_cents AS unitPriceCents
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC;
    `)
    .all(orderId);

  return {
    ...order,
    items,
  };
}

module.exports = {
  listOrders,
  getOrderById,
};
