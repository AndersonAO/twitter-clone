const express = require("express");
const app = express();
const router = express.Router();
const User = require("../database/schemas/UserSchema");

app.set("view engine", "pug");
app.set("views", "views");

router.get("/", (req, res) => {
  const payload = {
    pageTitle: "Inbox",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  res.status(200).render("inboxPage", payload);
});

router.get("/new", (req, res) => {
  const payload = {
    pageTitle: "Nova mensagem",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  res.status(200).render("newMessage", payload);
});


module.exports = router;
