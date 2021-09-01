const express = require('express');
const router = express.Router();
const User = require("../../database/schemas/UserSchema")
const Post = require("../../database/schemas/PostSchema")
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const rename = promisify(fs.rename)
const upload = multer({ dest: "uploads/" })

router.get('/', async (req, res, next) =>{
  let searchObj = req.query;

  if(searchObj.search) {
    searchObj = {
      $or: [
        { firstName: { $regex: searchObj.search, $options: "i" } },
        { lastName: { $regex: searchObj.search, $options: "i" } },
        { username: { $regex: searchObj.search, $options: "i" } },
      ]
    }
  }

  const users = await User.find(searchObj);
  res.status(200).send(users)
})

router.post("/profilePicture", upload.single("croppedImage"), async (req, res, next) => {
  console.log(req.file)
  console.log(req.body)
  if(!req.file) {
    console.log('Nenhum arquivo foi upado.');
    return res.sendStatus(400)
  }

  const filePath = `/uploads/images/${req.file.filename}.png`;
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `../../${filePath}`)

  await rename(tempPath, targetPath)
  .catch((error)=> {
    console.error(error)
    return res.sendStatus(400)
  })

  req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePic: filePath }, { new: true })

  return res.sendStatus(204)
})

router.post("/coverPhoto", upload.single("croppedImage"), async (req, res, next) => {
  console.log(req.file)
  console.log(req.body)
  if(!req.file) {
    console.log('Nenhum arquivo foi upado.');
    return res.sendStatus(400)
  }

  const filePath = `/uploads/images/${req.file.filename}.png`;
  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, `../../${filePath}`)

  await rename(tempPath, targetPath)
  .catch((error)=> {
    console.error(error)
    return res.sendStatus(400)
  })

  req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath }, { new: true })

  return res.sendStatus(204)
})


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

router.get("/:userId/followers", async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findOne({_id: userId })
    .populate("followers")
  if(!user) return res.json({ msg: 'nenhum usuário foi encontrado!' })
  res.json(user.followers)

})



router.get("/:userId/following", async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findOne({_id: userId })
    .populate("following")
  if(!user) return res.json({ msg: 'nenhum usuário foi encontrado!' })
  res.json(user.following)

})




module.exports = router;


