const express = require("express");
const router = express.Router();
const User = require("../../database/schemas/UserSchema");
const Post = require("../../database/schemas/PostSchema");

router.get("/", async (req, res, next) => {
  const searchObj = req.query;

  if (searchObj.isReply !== undefined) {
    const isReply = searchObj.isReply == "true";
    searchObj.replyTo = { $exists: isReply };
    delete searchObj.isReply;
  }

  if (searchObj.followingOnly !== undefined) {
    const followingOnly = searchObj.followingOnly == "true";

    if (followingOnly) {
      const objectIds = [];
      req.session.user.following?.forEach((user) => {
        objectIds.push(user);
      })
      objectIds.push(req.session.user._id);
      searchObj.postedBy = { $in: objectIds };
    }
    delete searchObj.followingOnly;
  }

  const posts = await getPosts(searchObj);
  res.status(200).send(posts);
});

router.get("/:id", async (req, res, next) => {
  const postId = req.params.id;
  console.log(postId);
  let post = await getPosts({ _id: postId });

  post = post[0];

  const results = {
    post,
  };

  if (post.replyTo) {
    results.replyTo = post.replyTo;
  }

  results.replies = await getPosts({ replyTo: postId });

  res.status(200).send(results);
});

router.post("/", async (req, res) => {
  if (!req.body.content) {
    console.log("conteudo não enviado");
    res.status(400).send("conteudo nao enviado");
    return;
  }

  var postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

  Post.create(postData)
    .then(async (newPost) => {
      newPost = await User.populate(newPost, { path: "postedBy" });
      console.log(newPost);
      res.status(201).send(newPost);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

router.put("/:id/like", async (req, res) => {
  const postId = req.params.id;
  const user = req.session.user;
  const userId = user._id;

  const isLiked = user.likes && user.likes.includes(postId);

  const option = isLiked ? "$pull" : "$addToSet";

  // Insert user like
  req.session.user = await User.findOneAndUpdate(
    { _id: userId },
    { [option]: { likes: postId } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });
  // insert post like
  const post = await Post.findOneAndUpdate(
    { _id: postId },
    { [option]: { likes: userId } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  res.status(200).send(post);
});

router.post("/:id/retweet", async (req, res) => {
  const postId = req.params.id;
  const user = req.session.user;
  const userId = user._id;

  // Try and delete retweet
  const deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  }).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  const option = deletedPost ? "$pull" : "$addToSet";

  let repost = deletedPost;

  if (!repost) {
    repost = await Post.create({ postedBy: userId, retweetData: postId }).catch(
      (error) => {
        console.log(error);
        res.sendStatus(400);
      }
    );
  }

  // Insert user like
  req.session.user = await User.findOneAndUpdate(
    { _id: userId },
    { [option]: { retweets: repost._id } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });
  // insert post like
  const post = await Post.findOneAndUpdate(
    { _id: postId },
    { [option]: { retweetUsers: userId } },
    { new: true }
  ).catch((error) => {
    console.log(error);
    res.sendStatus(400);
  });

  res.status(200).send(post);
});

router.delete("/:id", async (req, res) => {
  Post.findOneAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

async function getPosts(filter) {
  const posts = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ createdAt: 1 })
    .catch((error) => console.log(error));
  let data = posts;

  data = await User.populate(data, { path: "replyTo.postedBy" });
  return await User.populate(data, { path: "retweetData.postedBy" });
}

module.exports = router;
