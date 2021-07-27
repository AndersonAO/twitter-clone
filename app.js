require('dotenv').config()
const express = require('express');
const app = express();
const port = 3000;
const middleware = require('./middleware');
const database = require('./database/database')
const session = require('express-session')



app.set("view engine", "pug");
app.set("views", "views");
app.use(express.urlencoded({ extended: false}));
app.use(express.static("public"));

app.use(session({
  secret: String(process.env.session_key),
  resave: true,
  saveUninitialized: false,
}))


// Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logoutRoutes');

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);

app.get("/", middleware.requireLogin, (req, res)=>{

  const payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user
  }

  res.status(200).render("home", payload)
});



app.listen(port, ()=>console.log("Server listening on port " + port));

