const request = require("supertest");

jest.mock("../../src/services/AuthService");

const AuthService = require("../../src/services/AuthService");
const app = require("../../src/app");

describe("Auth routes", () => {
  afterEach(() => jest.clearAllMocks());

  it("POST /api/auth/signup creates an account", async () => {
    AuthService.signup.mockResolvedValue({
      user: { _id: "u1", name: "Ada", email: "ada@example.com" },
      token: "tok123"
    });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Ada", email: "ada@example.com", password: "secret123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBe("tok123");
  });

  it("POST /api/auth/login logs in", async () => {
    AuthService.login.mockResolvedValue({
      user: { _id: "u1", name: "Ada", email: "ada@example.com" },
      token: "tok123"
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ada@example.com", password: "secret123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBe("tok123");
  });
});
