require("dotenv").config();
const mongoose = require("mongoose");


class Database {

  constructor(){
    this.connect();
  }

  connect() {
    mongoose
      .connect(process.env.CONNECT_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      })
      .then(() => {
        console.log("DB CONNECTED");
      })
      .catch((err) => {
        console.log("CONNECTION FAILED " + err);
      });
  }
}

module.exports = new Database();