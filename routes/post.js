const mongoose = require("mongoose");

const postschema = mongoose.Schema({
  post: String,
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  comment: [
    {
      type: mongoose.Schema.Types.Mixed,
    },
  ],
});

module.exports = mongoose.model("post", postschema);
