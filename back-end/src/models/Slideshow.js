const mongoose = require("mongoose");

const SlideshowSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    title: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Slideshow", SlideshowSchema);
