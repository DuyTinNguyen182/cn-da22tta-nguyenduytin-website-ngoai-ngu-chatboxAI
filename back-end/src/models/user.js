const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userid: { type: String, required: true },
    username: { type: String, unique: true },
    password: { type: String },
    googleId: { type: String },
    authType: { type: String, enum: ["local", "google"], default: "local" },
    role: { type: String, enum: ["Student", "Admin"], default: "Student" },
    fullname: { type: String },
    gender: { type: String, default: null },
    genderEdited: { type: Boolean, default: false },
    address: { type: String },
    email: { type: String },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
