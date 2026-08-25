const express = require("express");
const app = express();
const BodyParser = require("body-parser");
const BookRoutes = require("./routes/BookRoutes");
const AuthRoutes = require("./routes/AuthRoutes");
const OrderRoutes = require("./routes/OrderRoutes");

// parse application/json
app.use(BodyParser.json());

app.use("/api/book", BookRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/api/orders", OrderRoutes);

module.exports = app;
