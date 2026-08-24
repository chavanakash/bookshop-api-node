const mongoose = require("mongoose");

const serverURI = process.env.DATABASE_URL || "mongodb://mongo/book";
const RETRY_DELAY_MS = 5000;

class DBConnection {
  constructor() {
    this._connect();
  }
  _connect() {
    mongoose
      .connect(serverURI, { useNewUrlParser: true })
      .then(() => {
        console.log("Database connection successful");
      })
      .catch(err => {
        console.error(`Database connection error, retrying in ${RETRY_DELAY_MS}ms`);
        console.log(err);
        setTimeout(() => this._connect(), RETRY_DELAY_MS);
      });
  }
}

module.exports = new DBConnection();
