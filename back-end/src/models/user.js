const mongoose = require('mongoose');

// Tham số thứ nhất: Định nghĩa các trường
const userSchema = new mongoose.Schema({
  userid: { type: String, required: true},
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Admin'] },
  fullname: { type: String },
  gender: { type: String , default: null},
  genderEdited: { type: Boolean, default: false },
  address: { type: String },
  email: { type: String },
  avatar: { type: String, default: "" },
  avatarPublicId: {
    type: String,
    default: null,
  },
}, 
{ 
  timestamps: true 
});

const User = mongoose.model('User', userSchema);
module.exports = User;