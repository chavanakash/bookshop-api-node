const PaymentService = require("../../src/services/PaymentService");

describe("PaymentService", () => {
  it("charges successfully for a normal card", async () => {
    const result = await PaymentService.charge({ amount: 20, cardNumber: "4242424242424242" });

    expect(result.status).toBe("paid");
    expect(result.transactionId).toMatch(/^TXN-/);
    expect(result.last4).toBe("4242");
  });

  it("declines a card ending in 0002", async () => {
    const result = await PaymentService.charge({ amount: 20, cardNumber: "4000000000000002" });

    expect(result.status).toBe("failed");
    expect(result.transactionId).toBeNull();
    expect(result.last4).toBe("0002");
  });

  it("handles a missing card number without throwing", async () => {
    const result = await PaymentService.charge({ amount: 20 });

    expect(result.last4).toBe("");
  });
});
