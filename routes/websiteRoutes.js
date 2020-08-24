const express = require("express");
const router = express.Router();
const database = require("./../database.js");
const pool = database.pool;
const passport = require("passport");

router.get("/", async (req,res) => {
  let loggedIn = false;
  if(req.isAuthenticated()){
    loggedIn = true;
  }
  res.render("index.ejs", {loggedIn: loggedIn});
});

router.get("/menu", async (req,res) => {
  let loggedIn = false;
  if(req.isAuthenticated()){
    loggedIn = true;
  }
  let rows = await database.getMenu();
  res.render("menu.ejs", {menu: rows, loggedIn: loggedIn});
});

router.get("/blog", async (req,res) => {
  let loggedIn = false;
  if(req.isAuthenticated()){
    loggedIn = true;
  }
  let rows = await database.getPosts();
  res.render("blog.ejs", {posts: rows, loggedIn: loggedIn});
});

router.get("/post/:id", async (req, res) => {
  let loggedIn = false;
  if(req.isAuthenticated()){
    loggedIn = true;
  }
  [post] = await database.getPost(req.params.id);
  res.render("post", {post: post, loggedIn: loggedIn});
});

module.exports = router;
