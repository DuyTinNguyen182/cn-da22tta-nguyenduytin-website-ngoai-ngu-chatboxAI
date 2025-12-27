const Languagelevel = require("../models/Language_level");
const Course = require("../models/Course");

const getAll = async () => {
  return await Languagelevel.find().populate("language_id");
};

const add = async ({ language_levelid, language_level, language_id }) => {
  const newLevel = new Languagelevel({
    language_levelid,
    language_level,
    language_id,
  });
  return await newLevel.save();
};

const deleteMany = async (ids) => {
  const CoursesUsing = await Course.find({ languagelevel_id: { $in: ids } });

  if (CoursesUsing.length > 0) {
    const usedLanguagelevelIds = CoursesUsing.map((t) =>
      t.languagelevel_id.toString()
    );
    return { success: false, usedLanguagelevelIds };
  }
  await Languagelevel.deleteMany({ _id: { $in: ids } });
  return { success: true };
};

const getById = async (id) => {
  return await Languagelevel.findById(id).populate("language_id");
};

const update = async (id, { language_level, language_id }) => {
  return await Languagelevel.findByIdAndUpdate(
    id,
    { language_level, language_id },
    { new: true }
  );
};

module.exports = {
  getAll,
  add,
  deleteMany,
  getById,
  update,
};
