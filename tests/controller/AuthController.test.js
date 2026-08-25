jest.mock("../../src/services/AuthService");

const AuthService = require("../../src/services/AuthService");
const AuthController = require("../../src/controller/AuthController");

function mockRes() {
  const res = { json: jest.fn() };
  res.status = jest.fn().mockReturnValue(res);
  return res;
}

describe("AuthController", () => {
  afterEach(() => jest.clearAllMocks());

  it("signup responds 201 with the token and public user fields", async () => {
    AuthService.signup.mockResolvedValue({
      user: { _id: "u1", name: "Ada", email: "ada@example.com", passwordHash: "secret" },
      token: "tok123"
    });
    const req = { body: { name: "Ada", email: "ada@example.com", password: "secret123" } };
    const res = mockRes();

    await AuthController.signup(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      token: "tok123",
      user: { id: "u1", name: "Ada", email: "ada@example.com" }
    });
  });

  it("signup responds with the service's error status on failure", async () => {
    const err = new Error("Email already registered");
    err.status = 409;
    AuthService.signup.mockRejectedValue(err);
    const res = mockRes();

    await AuthController.signup({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "Email already registered" });
  });

  it("signup falls back to a 500 for an error with no status", async () => {
    AuthService.signup.mockRejectedValue(new Error("unexpected"));
    const res = mockRes();

    await AuthController.signup({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("login responds with the token and public user fields", async () => {
    AuthService.login.mockResolvedValue({
      user: { _id: "u1", name: "Ada", email: "ada@example.com" },
      token: "tok123"
    });
    const res = mockRes();

    await AuthController.login({ body: {} }, res);

    expect(res.json).toHaveBeenCalledWith({
      token: "tok123",
      user: { id: "u1", name: "Ada", email: "ada@example.com" }
    });
  });

  it("login responds with the service's error status on failure", async () => {
    const err = new Error("Invalid email or password");
    err.status = 401;
    AuthService.login.mockRejectedValue(err);
    const res = mockRes();

    await AuthController.login({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid email or password" });
  });

  it("falls back to a 500 for an error with no status", async () => {
    AuthService.login.mockRejectedValue(new Error("unexpected"));
    const res = mockRes();

    await AuthController.login({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
