const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userId: String,
  },
  {
    versionKey: false,
    unique: true,
  }
);

const userModel = mongoose.model("userId", userSchema);

module.exports = userModel;
