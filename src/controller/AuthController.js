const AuthService = require("./../services/AuthService");

function toPublic(user) {
  return { id: user._id, name: user.name, email: user.email };
}

function AuthController() {
  const signup = function(req, res) {
    return AuthService.signup(req.body)
      .then(({ user, token }) => res.status(201).json({ token, user: toPublic(user) }))
      .catch(err => res.status(err.status || 500).json({ error: err.message }));
  };

  const login = function(req, res) {
    return AuthService.login(req.body)
      .then(({ user, token }) => res.json({ token, user: toPublic(user) }))
      .catch(err => res.status(err.status || 500).json({ error: err.message }));
  };

  return { signup, login };
}

module.exports = AuthController();
