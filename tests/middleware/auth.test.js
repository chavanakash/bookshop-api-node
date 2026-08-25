jest.mock("../../src/services/AuthService");

const AuthService = require("../../src/services/AuthService");
const requireAuth = require("../../src/middleware/auth");

function mockRes() {
  const res = { json: jest.fn() };
  res.status = jest.fn().mockReturnValue(res);
  return res;
}

describe("requireAuth middleware", () => {
  afterEach(() => jest.clearAllMocks());

  it("rejects a request with no Authorization header", () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an invalid or expired token", () => {
    AuthService.verifyToken.mockImplementation(() => {
      throw new Error("invalid token");
    });
    const req = { headers: { authorization: "Bearer bad-token" } };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches userId and calls next for a valid token", () => {
    AuthService.verifyToken.mockReturnValue({ sub: "u1", email: "ada@example.com" });
    const req = { headers: { authorization: "Bearer good-token" } };
    const res = mockRes();
    const next = jest.fn();

    requireAuth(req, res, next);

    expect(req.userId).toBe("u1");
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
