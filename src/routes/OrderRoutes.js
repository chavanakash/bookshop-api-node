const express = require("express");
const router = express.Router();
const requireAuth = require("./../middleware/auth");
const OrderController = require("./../controller/OrderController");

router.post("/checkout", requireAuth, OrderController.checkout);
router.get("/mine", requireAuth, OrderController.myOrders);

module.exports = router;
