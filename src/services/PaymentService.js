// Dummy payment processor — no real payment gateway is involved. Any card
// number ending in 0002 simulates a decline, so the failure path is
// actually exercisable in the app and in tests.
function PaymentService() {
  const charge = async ({ amount, cardNumber }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const last4 = String(cardNumber || "").slice(-4);

    if (last4 === "0002") {
      return { status: "failed", transactionId: null, last4 };
    }

    return {
      status: "paid",
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      last4
    };
  };

  return { charge };
}

module.exports = PaymentService();
