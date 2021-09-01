const express = require("express");
const app = express();
const router = express.Router();
const User = require("../database/schemas/UserSchema");

app.set("view engine", "pug");
app.set("views", "views");

router.get("/", (req, res) => {
  const payload = createPayload(req.session.user)

  res.status(200).render("searchPage", payload);
});

router.get("/:selectedTab", (req, res) => {
  const payload = createPayload(req.session.user)
  payload.selectedTab = req.params.selectedTab;
  res.status(200).render("searchPage", payload);
});

function createPayload(userLoggedIn){
  return {
    pageTitle: "Pesquisar",
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
  };
}

module.exports = router;
