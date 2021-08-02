const express = require('express');
const router = express.Router();
const User = require("../../database/schemas/UserSchema")
const Post = require("../../database/schemas/PostSchema")



router.get("/", async (req, res, next) => {
  const posts = await Post.find().populate('postedBy').sort({ createdAt: 1 })
  const data = posts
  res.status(200).send(data)
})

router.post("/", async (req, res)=>{
  if(!req.body.content) {
    console.log("conteudo não enviado")
    res.status(400).send('conteudo nao enviado')
    return
  }

  var postData = {
    content: req.body.content,
    postedBy: req.session.user
  }

  Post.create(postData)
    .then(async newPost=>{
      newPost = await User.populate(newPost, { path: "postedBy" })
      console.log(newPost)
      res.status(201).send(newPost);
    })
    .catch(err=>{
      console.log(err)
      res.sendStatus(400)
    })

});


module.exports = router;


