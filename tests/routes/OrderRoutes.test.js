const request = require("supertest");

jest.mock("../../src/services/AuthService");
jest.mock("../../src/services/OrderService");

const AuthService = require("../../src/services/AuthService");
const OrderService = require("../../src/services/OrderService");
const app = require("../../src/app");

describe("Order routes", () => {
  afterEach(() => jest.clearAllMocks());

  it("rejects checkout with no auth token", async () => {
    const res = await request(app).post("/api/orders/checkout").send({ items: [] });

    expect(res.status).toBe(401);
    expect(OrderService.checkout).not.toHaveBeenCalled();
  });

  it("checks out successfully with a valid token", async () => {
    AuthService.verifyToken.mockReturnValue({ sub: "u1", email: "ada@example.com" });
    OrderService.checkout.mockResolvedValue({ _id: "o1", total: 20 });

    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", "Bearer good-token")
      .send({ items: [{ bookId: "b1", qty: 1 }], payment: { cardNumber: "4242424242424242" } });

    expect(res.status).toBe(201);
    expect(OrderService.checkout).toHaveBeenCalledWith("u1", expect.any(Object));
  });

  it("GET /api/orders/mine returns the user's orders with a valid token", async () => {
    AuthService.verifyToken.mockReturnValue({ sub: "u1", email: "ada@example.com" });
    OrderService.myOrders.mockResolvedValue([{ _id: "o1" }]);

    const res = await request(app)
      .get("/api/orders/mine")
      .set("Authorization", "Bearer good-token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ _id: "o1" }]);
  });
});
