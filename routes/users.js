const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/register");

const userschema = mongoose.Schema({
  name: String,
  username: String,
  password: Number,
  img: {
    type: String,
    default: "360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg",
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

userschema.plugin(plm);
module.exports = mongoose.model("user", userschema);
