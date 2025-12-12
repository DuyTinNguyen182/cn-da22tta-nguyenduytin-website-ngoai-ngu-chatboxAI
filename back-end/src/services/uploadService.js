const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/**
 * Upload file Buffer lên Cloudinary sử dụng Stream
 * @param {Buffer} fileBuffer
 * @param {String} folderName
 * @returns {Promise<String>}
 */
const uploadImageToCloudinary = (fileBuffer, folderName = "uploads") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

module.exports = {
  uploadImageToCloudinary,
};
