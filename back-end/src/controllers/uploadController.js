// src/controllers/uploadController.js
const uploadService = require("../services/uploadService");

const uploadImage = (fieldName, folderName) => async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const imageUrl = await uploadService.uploadImageToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      folderName
    );

    req.body[fieldName] = imageUrl;

    next();

  } catch (error) {
    console.error(`Error in uploadImage middleware for ${fieldName}:`, error.message);
    res.status(500).json({ success: false, message: error.message || `Failed to upload ${fieldName}.` });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const imageUrl = await uploadService.uploadImageToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      "avatars" // Tên folder cụ thể cho avatar
    );

    res.status(200).json({ success: true, url: imageUrl, message: "Avatar uploaded successfully." });
  } catch (error) {
    console.error("Error in uploadAvatar controller:", error.message);
    res.status(500).json({ success: false, message: error.message || "Failed to upload avatar." });
  }
};

module.exports = {
  uploadImage,
  uploadAvatar,
};