const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "/images/profilePic.jpeg"
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }]
}, { timestamps: true,  });


const User = mongoose.model("users", UserSchema);

module.exports = User