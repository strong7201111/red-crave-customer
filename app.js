require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const favicon = require("serve-favicon");
const session = require("express-session")({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: { maxAge: 2 * 60 * 60 * 1000 }
});
const database = require("./database.js");
const authenticationRoutes = require("./routes/authenticationRoutes.js");
const websiteRoutes = require("./routes/websiteRoutes.js");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
//app.use(favicon(path.join(__dirname, 'public','images','Red-Crave.ico'))); 
app.use(flash());
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

//initialize database
database.initialize();

//initialize passport
const intializePassport = require("./passport-config");
intializePassport(passport);

app.use(authenticationRoutes);
app.use(websiteRoutes);

let port = process.env.PORT || 3000;

app.listen(port, ()=>{
  console.log("server running on port 3000");
});
