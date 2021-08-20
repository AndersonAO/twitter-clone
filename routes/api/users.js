const express = require('express');
const router = express.Router();
const User = require("../../database/schemas/UserSchema")
const Post = require("../../database/schemas/PostSchema")



router.put("/:userId/follow", async (req, res, next) => {
  const userId = req.params.userId;
  const user = req.session.user;

  const userExists = await User.findOne({_id: userId})

  if(!userExists)  return res.sendStatus(404);
  
  const isFollowing = user.following?.includes(userId);

  const option = isFollowing ? "$pull" : "$addToSet"

  req.session.user = await User.findOneAndUpdate({_id: req.session.user._id}, { [option]: { following: userId }}, { new: true })
    .catch(error => {
      console.log(error)
      res.sendStatus(400)
    })
  User.findOneAndUpdate({_id: userId}, { [option]: { followers: req.session.user._id }})
    .catch(error => {
      console.log(error)
      res.sendStatus(400)
    })
  res.json(req.session.user)

})




module.exports = router;


