const OrderService = require("./../services/OrderService");

function OrderController() {
  const checkout = function(req, res) {
    return OrderService.checkout(req.userId, req.body)
      .then(order => res.status(201).json(order))
      .catch(err => res.status(err.status || 500).json({ error: err.message }));
  };

  const myOrders = function(req, res) {
    return OrderService.myOrders(req.userId)
      .then(orders => res.json(orders))
      .catch(err => res.status(500).json({ error: err.message }));
  };

  return { checkout, myOrders };
}

module.exports = OrderController();
