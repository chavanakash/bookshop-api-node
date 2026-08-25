jest.mock("../../src/services/OrderService");

const OrderService = require("../../src/services/OrderService");
const OrderController = require("../../src/controller/OrderController");

function mockRes() {
  const res = { json: jest.fn() };
  res.status = jest.fn().mockReturnValue(res);
  return res;
}

describe("OrderController", () => {
  afterEach(() => jest.clearAllMocks());

  it("checkout responds 201 with the created order", async () => {
    OrderService.checkout.mockResolvedValue({ _id: "o1", total: 20 });
    const req = { userId: "u1", body: { items: [] } };
    const res = mockRes();

    await OrderController.checkout(req, res);

    expect(OrderService.checkout).toHaveBeenCalledWith("u1", req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ _id: "o1", total: 20 });
  });

  it("checkout responds with the service's error status on failure", async () => {
    const err = new Error("Not enough stock");
    err.status = 409;
    OrderService.checkout.mockRejectedValue(err);
    const res = mockRes();

    await OrderController.checkout({ userId: "u1", body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Not enough stock" });
  });

  it("checkout falls back to a 500 for an error with no status", async () => {
    OrderService.checkout.mockRejectedValue(new Error("unexpected"));
    const res = mockRes();

    await OrderController.checkout({ userId: "u1", body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("myOrders responds with the user's orders", async () => {
    OrderService.myOrders.mockResolvedValue([{ _id: "o1" }]);
    const res = mockRes();

    await OrderController.myOrders({ userId: "u1" }, res);

    expect(OrderService.myOrders).toHaveBeenCalledWith("u1");
    expect(res.json).toHaveBeenCalledWith([{ _id: "o1" }]);
  });

  it("myOrders responds with a 500 on failure", async () => {
    OrderService.myOrders.mockRejectedValue(new Error("db down"));
    const res = mockRes();

    await OrderController.myOrders({ userId: "u1" }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "db down" });
  });
});
