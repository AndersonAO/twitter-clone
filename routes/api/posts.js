const express = require('express');
const router = express.Router();
const User = require("../../database/schemas/UserSchema")



router.get("/", (req, res)=>{
  
});

router.post("/", async (req, res)=>{
  if(!req.body.content) {
    console.log("conteudo não enviado")
    res.status(400).send('conteudo nao enviado')
    return
  }

  res
  .status(200)
  .send("it worked")
});


module.exports = router;


