const express = require("express");
const app = express();
const router = express.Router();
const User = require("../database/schemas/UserSchema");

app.set("view engine", "pug");
app.set("views", "views");

router.get("/", (req, res) => {
  const payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };

  res.status(200).render("profilePage", payload);
});

router.get("/:username", async (req, res) => {
  const payload = await getPayload(req.params.username, req.session.user)

  res.status(200).render("profilePage", payload);
});

router.get("/:username/replies", async (req, res) => {
  const payload = await getPayload(req.params.username, req.session.user)
  payload.selectedTab = "replies"

  res.status(200).render("profilePage", payload);
});

async function getPayload(username, userLoggedIn) {
  const user = await User.findOne({ $or: [ { username: username } ] });
  if (!user){
    return {
      pageTitle: "Usuário não encontrado",
      userLoggedIn,
      userLoggedInJs: JSON.stringify(userLoggedIn),
    };
  }
  return {
    pageTitle: user.username,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user
  };
}

module.exports = router;
