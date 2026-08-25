const Book = require("../models/Book");
const Order = require("../models/Order");
const Payment = require("./PaymentService");

// Standalone MongoDB (no replica set) can't do multi-document transactions,
// so stock is reserved item-by-item with atomic conditional decrements and
// manually rolled back on failure instead.
async function reserveStock(items) {
  const reserved = [];
  for (const item of items) {
    const book = await Book.findOneAndUpdate(
      { _id: item.bookId, qty: { $gte: item.qty } },
      { $inc: { qty: -item.qty } },
      { new: true }
    );
    if (!book) {
      await releaseStock(reserved);
      const err = new Error(`Not enough stock for "${item.title || item.bookId}"`);
      err.status = 409;
      throw err;
    }
    reserved.push({ bookId: item.bookId, qty: item.qty, book });
  }
  return reserved;
}

async function releaseStock(reserved) {
  for (const r of reserved) {
    await Book.findByIdAndUpdate(r.bookId, { $inc: { qty: r.qty } });
  }
}

function OrderService() {
  const checkout = async (userId, { items, payment }) => {
    if (!items || items.length === 0) {
      const err = new Error("No items to check out");
      err.status = 400;
      throw err;
    }

    const reserved = await reserveStock(items);

    const orderItems = reserved.map(r => ({
      book: r.book._id,
      title: r.book.title,
      qty: r.qty,
      price: r.book.price
    }));
    const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

    const charge = await Payment.charge({
      amount: total,
      cardNumber: payment && payment.cardNumber
    });

    if (charge.status !== "paid") {
      await releaseStock(reserved);
      const err = new Error("Payment declined");
      err.status = 402;
      throw err;
    }

    return new Order({
      user: userId,
      items: orderItems,
      total,
      payment: {
        method: "card",
        last4: charge.last4,
        transactionId: charge.transactionId,
        status: charge.status
      }
    }).save();
  };

  const myOrders = userId => Order.find({ user: userId }).sort({ createdAt: -1 });

  return { checkout, myOrders };
}

module.exports = OrderService();
