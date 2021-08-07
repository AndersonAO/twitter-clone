const express = require('express');
const User = require('../database/schemas/UserSchema');
const bcrypt = require('bcrypt')
const router = express.Router();

router.get("/", (req, res)=>{
  res.status(200).render("register")
});

router.post("/", async (req, res)=>{
  const body = {};
  for (let name in req.body){
    if(name == 'password') {
      body[name] = req.body[name]
      continue;
    }
    body[name] = req.body[name].trim();
  }
  
  const payload = req.body
  console.log(body)

  if(!body.firstName || !body.lastName || !body.email || !body.username || !body.password){
    payload.errorMessage = "Tenha certeza que todos os campos estão preenchidos"
    res.status(200).render("register", payload)
    return
  }

  const user = await User.findOne({
    $or: [
      { username: body.username},
      { email: body.email }
    ]
  })
  .catch((err)=>{
    console.log(err)
    payload.errorMessage = "Algo deu errado."
    res.status(200).render("register", payload)
  })

  if(user){
    if(body.email == user.email){
      payload.errorMessage = "Email já cadastrado!"
    } else {
      payload.errorMessage = "Usuário já cadastrado!"
    }
    return res.status(200).render("register", payload)
  }
  body.password = await bcrypt.hash(body.password, 10)
  const newUser = await User.create(body)
  req.session.user = newUser;
  res.status(200).redirect("/")
});

module.exports = router;


