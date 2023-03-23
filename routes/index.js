var express = require("express");
// const usermodel = require("mongoose")
var router = express.Router();
const usermodel = require("./users");
const passport = require("passport");
const localstrategy = require("passport-local");
const postmodel = require("./post");
const multer = require("multer");

passport.use(new localstrategy(usermodel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    const unique =
      Date.now() + Math.round(Math.random() * 10000) + `${file.originalname}`;
    cb(null, unique);
  },
});

const upload = multer({ storage: storage });

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/profile", isloggedin, function (req, res, next) {
  usermodel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts")
    .then(function (data) {
      res.render("profile", { data });
      // res.send(data);
    });
  // res.send("You are loggedin");
});

router.post("/post", isloggedin, function (req, res) {
  usermodel
    .findOne({
      username: req.session.passport.user,
    })
    .then(function (loggedinuser) {
      postmodel
        .create({
          post: req.body.post,
          userid: loggedinuser._id,
        })
        .then(function (createdpost) {
          loggedinuser.posts.push(createdpost._id);
          loggedinuser.save().then(function () {
            res.redirect("/profile");
          });
        });
    });
});

router.get("/like/:plc", isloggedin, function (req, res) {
  usermodel
    .findOne({
      username: req.session.passport.user,
    })
    .then(function (founduser) {
      postmodel
        .findOne({
          _id: req.params.plc,
        })
        .then(function (foundpost) {
          if (foundpost.likes.indexOf(founduser._id) === -1) {
            foundpost.likes.push(founduser._id);
          } else {
            var khapehai = foundpost.likes.indexOf(founduser._id);
            foundpost.likes.splice(khapehai, 1);
          }
          foundpost.save().then(function () {
            res.redirect(req.headers.referer);
          });
        });
    });
});

router.post("/comment/:id", isloggedin, async function (req, res) {
  // usermodel.findOne({ username: req.session.passport.user });
  let loggedinuser = await usermodel.findOne({
    username: req.session.passport.user,
  });
  let foundpost = await postmodel.findOne({
    _id: req.params.id,
  });
  // res.send(req.body.comment);
  // res.send(foundpost);
  foundpost.comment.push({
    username: loggedinuser.username,
    name: loggedinuser.name,
    comment: req.body.comment,
    // console.log(req.body.comment)
  });
  // console.log(loggedinuser);
  await foundpost.save();
  // res.redirect("/profile");
  res.redirect(req.headers.referer);
});

router.post("/upload", isloggedin, upload.single("image"), function (req, res) {
  usermodel
    .findOne({
      username: req.session.passport.user,
    })
    .then(function (userfound) {
      userfound.img = req.file.filename;
      userfound.save();
      res.redirect(req.headers.referer);
      // res.send(req.file);
    });
});

router.get("/removepost/:id", isloggedin, function (req, res) {
  postmodel
    .findOneAndDelete({
      _id: req.params.id,
    })
    .then(function () {
      res.redirect("/profile");
    });
});

router.get("/allpost", isloggedin, function (req, res) {
  usermodel
    .findOne({
      username: req.session.passport.user,
    })
    .populate("posts")
    .then(function (data) {
      postmodel
        .find()
        .populate("userid")
        .then(function (allpost) {
          res.render("feed", { allpost, data });
          // res.send(allpost);
        });
    });
});

router.post("/register", function (req, res) {
  var newuser = new usermodel({
    name: req.body.name,
    username: req.body.username,
  });
  usermodel
    .register(newuser, req.body.password)
    .then(function (u) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })
    .catch(function (e) {
      res.send(e);
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  })
);

router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

function isloggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}
module.exports = router;
