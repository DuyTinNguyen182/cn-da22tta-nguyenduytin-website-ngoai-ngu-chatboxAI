const uploadService = require("../services/uploadService");

const uploadImage = (fieldName, folderName) => async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const imageUrl = await uploadService.uploadImageToCloudinary(
      req.file.buffer,
      folderName
    );

    req.body[fieldName] = imageUrl;

    next();
  } catch (error) {
    console.error(`Lỗi upload ảnh ${fieldName}:`, error.message);
    res.status(500).json({ success: false, message: "Lỗi khi upload ảnh." });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Chưa chọn file." });
    }

    const imageUrl = await uploadService.uploadImageToCloudinary(
      req.file.buffer,
      "avatars"
    );

    res.status(200).json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Lỗi upload avatar:", error.message);
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
};

module.exports = {
  uploadImage,
  uploadAvatar,
};
