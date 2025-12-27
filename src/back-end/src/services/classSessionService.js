const ClassSession = require("../models/ClassSession");

const createSession = async (data) => {
  const newSession = new ClassSession(data);
  return await newSession.save();
};

const getAllSessions = async () => {
  return await ClassSession.find().sort({ createdAt: -1 });
};

const deleteSession = async (id) => {
  return await ClassSession.findByIdAndDelete(id);
};

const deleteMultipleSessions = async (ids) => {
  return await ClassSession.deleteMany({ _id: { $in: ids } });
};

module.exports = {
  createSession,
  getAllSessions,
  deleteSession,
  deleteMultipleSessions,
};
