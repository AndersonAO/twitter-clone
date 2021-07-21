const express = require('express');
const app = express();
const router = express.Router();

app.set("view engine", "pug")
app.set("views", "views")

router.get("/", (req, res)=>{
  res.status(200).render("login")
});

router.post("/", (req, res)=>{
  
  res.status(200).render("login")
});

module.exports = router;


