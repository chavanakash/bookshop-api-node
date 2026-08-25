jest.mock("../../src/models/User");

const User = require("../../src/models/User");
const AuthService = require("../../src/services/AuthService");

describe("AuthService", () => {
  afterEach(() => jest.clearAllMocks());

  describe("signup", () => {
    it("creates a new user and returns a token", async () => {
      User.findOne.mockResolvedValue(null);
      const saveMock = jest.fn().mockResolvedValue({
        _id: "u1",
        name: "Ada",
        email: "ada@example.com"
      });
      User.mockImplementation(() => ({ save: saveMock }));

      const { user, token } = await AuthService.signup({
        name: "Ada",
        email: "ada@example.com",
        password: "secret123"
      });

      expect(user.email).toBe("ada@example.com");
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3);
    });

    it("rejects signup with an already-registered email", async () => {
      User.findOne.mockResolvedValue({ _id: "u1", email: "ada@example.com" });

      await expect(
        AuthService.signup({ name: "Ada", email: "ada@example.com", password: "secret123" })
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe("login", () => {
    it("rejects login for an unknown email", async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        AuthService.login({ email: "nobody@example.com", password: "x" })
      ).rejects.toMatchObject({ status: 401 });
    });

    it("rejects login with the wrong password", async () => {
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash("correct-password", 10);
      User.findOne.mockResolvedValue({ _id: "u1", email: "ada@example.com", passwordHash });

      await expect(
        AuthService.login({ email: "ada@example.com", password: "wrong-password" })
      ).rejects.toMatchObject({ status: 401 });
    });

    it("logs in successfully with the right password", async () => {
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash("correct-password", 10);
      User.findOne.mockResolvedValue({ _id: "u1", email: "ada@example.com", passwordHash });

      const { user, token } = await AuthService.login({
        email: "ada@example.com",
        password: "correct-password"
      });

      expect(user.email).toBe("ada@example.com");
      expect(typeof token).toBe("string");
    });
  });

  describe("verifyToken", () => {
    it("round-trips a token issued by login", async () => {
      const bcrypt = require("bcryptjs");
      const passwordHash = await bcrypt.hash("correct-password", 10);
      User.findOne.mockResolvedValue({ _id: "u1", email: "ada@example.com", passwordHash });

      const { token } = await AuthService.login({
        email: "ada@example.com",
        password: "correct-password"
      });

      const payload = AuthService.verifyToken(token);
      expect(payload.sub).toBe("u1");
      expect(payload.email).toBe("ada@example.com");
    });

    it("throws for a garbage token", () => {
      expect(() => AuthService.verifyToken("not-a-real-token")).toThrow();
    });
  });
});
