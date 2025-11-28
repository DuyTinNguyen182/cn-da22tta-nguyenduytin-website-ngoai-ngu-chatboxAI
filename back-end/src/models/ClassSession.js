const mongoose = require("mongoose");

const ClassSessionSchema = new mongoose.Schema(
  {
    // Ví dụ: "Thứ 2 - 4 - 6", "Thứ 3 - 5 - 7", "Thứ 7 - CN"
    days: {
      type: String,
      required: true,
      trim: true,
    },

    // Ví dụ: "17:45 - 19:15", "19:30 - 21:00"
    time: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ClassSession", ClassSessionSchema);
