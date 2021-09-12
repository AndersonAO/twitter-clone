const express = require('express');
const app = express();
const router = express.Router();
const User = require('../database/schemas/UserSchema');
const bcrypt = require('bcrypt')

app.set("view engine", "pug")
app.set("views", "views")

router.get("/", (req, res)=>{
  res.status(200).render("login")
});

router.post("/", async (req, res)=>{
  
  const payload = req.body;

  if(req.body.logUsername && req.body.logPassword){
    const user = await User.findOne({
      $or: [
        { username: req.body.logUsername},
        { email: req.body.logUsername }
      ]
    })
    .catch((err)=>{
      console.log(err)
      payload.errorMessage = "Algo deu errado."
      res.status(200).render("login", payload)
    })

    if(user){
      const result = await bcrypt.compare(req.body.logPassword, user.password);

      if(result) {
        delete user.password
        req.session.user = user;
        return res.redirect('/');
      }
    }
    payload.errorMessage = "Credenciais incorretas."
    return res.status(200).render("login", payload)
  }

  payload.errorMessage = "Tenha certeza que os campos estão preenchidos."
  res.status(200).render("login", payload)
});

router.get("/logout", (req, res)=>{
  if(req.session) {
    req.session.destroy(()=>{
      res.redirect('/login');
    });
  }
});

module.exports = router;


