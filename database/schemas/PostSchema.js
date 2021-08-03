const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  content: { type: String, trim: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  pinned: Boolean,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }]
}, { timestamps: true,  });


const Post = mongoose.model("Posts", PostSchema);

module.exports = Post