const express = require('express');
const { getOrderById, listOrders } = require('../db/orders-repository');

const router = express.Router();

function respondWithDbFailure(res, error, operation) {
  console.error(`Database operation failed: ${operation}`, error);
  return res.status(500).json({ error: `Failed to ${operation}.` });
}

router.get('/orders', (req, res) => {
  try {
    const orders = listOrders();
    return res.json({ data: orders });
  } catch (error) {
    return respondWithDbFailure(res, error, 'retrieve orders');
  }
});

router.get('/orders/:orderId', (req, res) => {
  try {
    const order = getOrderById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: `Order ${req.params.orderId} not found.` });
    }

    return res.json({ data: order });
  } catch (error) {
    return respondWithDbFailure(res, error, 'retrieve order detail');
  }
});

module.exports = {
  ordersRouter: router,
};
