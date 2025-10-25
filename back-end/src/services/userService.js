const User = require("../models/user");
const bcrypt = require("bcrypt");

const getAllUsers = async () => {
  return await User.find();
};

const getUserById = async (userId) => {
  return await User.findById(userId);
};

const getCurrentUser = async (userId) => {
  return await User.findById(userId);
};

const deleteUsersByIds = async (userIds) => {
  const users = await User.find({ _id: { $in: userIds } });
  if (users.length !== userIds.length) return null;
  await User.deleteMany({ _id: { $in: userIds } });
  return true;
};

const updateUserById = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) return null;

  if (data.fullname) user.fullname = data.fullname;
  if (data.email) user.email = data.email;
  if (data.username) user.username = data.username;
  if (data.password) user.password = await bcrypt.hash(data.password, 10);
  if (data.address) user.address = data.address;
  if (data.role) user.role = data.role;
  if (data.avatar) user.avatar = data.avatar;

  // Chỉ cho phép sửa giới tính 1 lần duy nhất
  if (data.gender !== undefined) {
    if (user.genderEdited) {
      return null;
    } else {
      user.gender = data.gender;
      user.genderEdited = true;
    }
  }

  await user.save();
  return user;
};

module.exports = {
  getAllUsers,
  getUserById,
  getCurrentUser,
  deleteUsersByIds,
  updateUserById,
};
