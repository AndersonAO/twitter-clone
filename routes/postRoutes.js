const express = require('express');
const app = express();
const router = express.Router();
const User = require('../database/schemas/UserSchema');


app.set("view engine", "pug")
app.set("views", "views")

router.get("/:id", (req, res)=>{

  const payload = {
    pageTitle: "Exibir postagem",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.id
  }

  res.status(200).render("postPage", payload)
});


module.exports = router;


