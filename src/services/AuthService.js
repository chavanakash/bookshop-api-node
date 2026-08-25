const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, {
    expiresIn: "7d"
  });
}

function AuthService() {
  const signup = async ({ name, email, password }) => {
    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error("Email already registered");
      err.status = 409;
      throw err;
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await new User({ name, email, passwordHash }).save();
    return { user, token: signToken(user) };
  };

  const login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }
    return { user, token: signToken(user) };
  };

  const verifyToken = token => jwt.verify(token, JWT_SECRET);

  return { signup, login, verifyToken };
}

module.exports = AuthService();
