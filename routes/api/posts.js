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

router.put("/:id/like", async (req, res)=>{

  const postId = req.params.id;
  const user = req.session.user;
  const userId = user._id;

  const isLiked = user.likes && user.likes.includes(postId);

  const option = isLiked ? "$pull" : "$addToSet"

  // Insert user like
  req.session.user = await User.findOneAndUpdate({ _id: userId }, { [option]: { likes: postId }}, { new: true })
  .catch(error => {
    console.log(error)
    res.sendStatus(400)
  })
  // insert post like
  const post = await Post.findOneAndUpdate({ _id: postId }, { [option]: { likes: userId }}, { new: true })
  .catch(error => {
    console.log(error)
    res.sendStatus(400)
  })

  res.status(200).send(post)
});

router.post("/:id/retweet", async (req, res)=>{
  const postId = req.params.id;
  const user = req.session.user;
  const userId = user._id;

  // Try and delete retweet
  const deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
  .catch(error => {
    console.log(error)
    res.sendStatus(400)
  })

  
  const option = deletedPost ? "$pull" : "$addToSet"
  
  let repost = deletedPost;

  if(!repost){
    repost = await Post.create({ postedBy: userId, retweetData: postId })
    .catch(error => {
      console.log(error)
      res.sendStatus(400)
    })
  }

  // Insert user like
  req.session.user = await User.findOneAndUpdate({ _id: userId }, { [option]: { retweets: repost._id }}, { new: true })
  .catch(error => {
    console.log(error)
    res.sendStatus(400)
  })
  // insert post like
  const post = await Post.findOneAndUpdate({ _id: postId }, { [option]: { retweetUsers: userId }}, { new: true })
  .catch(error => {
    console.log(error)
    res.sendStatus(400)
  })

  
  res.status(200).send(post)
});



module.exports = router;


