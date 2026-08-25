const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [
      {
        book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        title: String,
        qty: Number,
        price: Number
      }
    ],
    total: {
      type: Number,
      required: true
    },
    payment: {
      method: String,
      last4: String,
      transactionId: String,
      status: { type: String, enum: ["paid", "failed"], required: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
