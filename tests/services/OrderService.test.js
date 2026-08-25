jest.mock("../../src/models/Book");
jest.mock("../../src/models/Order");
jest.mock("../../src/services/PaymentService");

const Book = require("../../src/models/Book");
const Order = require("../../src/models/Order");
const Payment = require("../../src/services/PaymentService");
const OrderService = require("../../src/services/OrderService");

describe("OrderService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("checkout", () => {
    it("rejects an empty checkout", async () => {
      await expect(OrderService.checkout("u1", { items: [] })).rejects.toMatchObject({
        status: 400
      });
      expect(Book.findOneAndUpdate).not.toHaveBeenCalled();
    });

    it("decrements stock and creates an order on success", async () => {
      Book.findOneAndUpdate.mockResolvedValue({
        _id: "b1",
        title: "The Silent Garden",
        price: 10,
        qty: 4
      });
      Payment.charge.mockResolvedValue({ status: "paid", transactionId: "TXN-1", last4: "4242" });
      const saveMock = jest.fn().mockResolvedValue({ _id: "o1", total: 20 });
      Order.mockImplementation(() => ({ save: saveMock }));

      const items = [{ bookId: "b1", title: "The Silent Garden", qty: 2 }];
      await OrderService.checkout("u1", {
        items,
        payment: { cardNumber: "4242424242424242" }
      });

      expect(Book.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "b1", qty: { $gte: 2 } },
        { $inc: { qty: -2 } },
        { new: true }
      );
      expect(Payment.charge).toHaveBeenCalledWith({ amount: 20, cardNumber: "4242424242424242" });
      expect(saveMock).toHaveBeenCalled();
      expect(Book.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("rejects and does not charge when stock is insufficient", async () => {
      Book.findOneAndUpdate.mockResolvedValue(null);

      const items = [{ bookId: "b1", title: "The Silent Garden", qty: 99 }];
      await expect(OrderService.checkout("u1", { items, payment: {} })).rejects.toMatchObject({
        status: 409
      });

      expect(Payment.charge).not.toHaveBeenCalled();
      expect(Book.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it("falls back to the bookId in the error message when no title is given", async () => {
      Book.findOneAndUpdate.mockResolvedValue(null);

      const items = [{ bookId: "b1", qty: 99 }];
      await expect(
        OrderService.checkout("u1", { items, payment: {} })
      ).rejects.toMatchObject({ message: 'Not enough stock for "b1"' });
    });

    it("rolls back an earlier successful reservation when a later item fails", async () => {
      Book.findOneAndUpdate
        .mockResolvedValueOnce({ _id: "b1", title: "Book One", price: 10, qty: 3 })
        .mockResolvedValueOnce(null); // second item out of stock

      const items = [
        { bookId: "b1", title: "Book One", qty: 1 },
        { bookId: "b2", title: "Book Two", qty: 99 }
      ];

      await expect(OrderService.checkout("u1", { items, payment: {} })).rejects.toMatchObject({
        status: 409
      });

      // The whole order failed, so the first item's reservation must be released.
      expect(Book.findByIdAndUpdate).toHaveBeenCalledWith("b1", { $inc: { qty: 1 } });
      expect(Payment.charge).not.toHaveBeenCalled();
    });

    it("releases reserved stock when payment is declined", async () => {
      Book.findOneAndUpdate.mockResolvedValue({
        _id: "b1",
        title: "The Silent Garden",
        price: 10,
        qty: 4
      });
      Payment.charge.mockResolvedValue({ status: "failed", transactionId: null, last4: "0002" });

      const items = [{ bookId: "b1", title: "The Silent Garden", qty: 2 }];
      await expect(
        OrderService.checkout("u1", { items, payment: { cardNumber: "4000000000000002" } })
      ).rejects.toMatchObject({ status: 402 });

      expect(Book.findByIdAndUpdate).toHaveBeenCalledWith("b1", { $inc: { qty: 2 } });
    });
  });

  describe("myOrders", () => {
    it("returns orders for the given user, newest first", async () => {
      const sortMock = jest.fn().mockResolvedValue([{ _id: "o1" }]);
      Order.find.mockReturnValue({ sort: sortMock });

      const orders = await OrderService.myOrders("u1");

      expect(Order.find).toHaveBeenCalledWith({ user: "u1" });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(orders).toEqual([{ _id: "o1" }]);
    });
  });
});
