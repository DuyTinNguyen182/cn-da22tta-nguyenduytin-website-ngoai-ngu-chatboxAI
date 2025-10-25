// src/services/uploadService.js
const cloudinary = require("../config/cloudinary");

const uploadImageToCloudinary = async (fileBuffer, mimetype, folderName = "uploads") => {
  try {
    if (!fileBuffer || !mimetype) {
      throw new Error("File buffer and mimetype are required.");
    }

    const fileStr = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(fileStr, {
      folder: folderName,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary in service:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};

module.exports = {
  uploadImageToCloudinary,
};