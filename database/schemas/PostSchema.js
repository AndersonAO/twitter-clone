const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  content: { type: String, trim: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  pinned: Boolean,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  retweetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  retweetData: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts' },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts' },
}, { timestamps: true,  });


const Post = mongoose.model("Posts", PostSchema);

module.exports = Post