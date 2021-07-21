const express = require('express');
const app = express();
const port = 3000;
const middleware = require('./middleware');
const db = require('./database/database');



app.set("view engine", "pug");
app.set("views", "views");
app.use(express.urlencoded({ extended: false}));
app.use(express.static("public"));


// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');

app.use("/login", loginRoute);
app.use("/register", registerRoute);

app.get("/", middleware.requireLogin, (req, res)=>{

  const payload = {
    pageTitle: "Home",
  }

  res.status(200).render("home", payload)
});



app.listen(port, ()=>console.log("Server listening on port " + port));

