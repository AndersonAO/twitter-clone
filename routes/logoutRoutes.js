const express = require('express');
const app = express();
const router = express.Router();
const User = require('../database/schemas/UserSchema');
const bcrypt = require('bcrypt')


router.get("/", (req, res)=>{
  if(req.session) {
    req.session.destroy(()=>{
      res.redirect('/login');
    });
  }
});



module.exports = router;


