// src/routes/upload.js
const express = require("express");
const multer = require("multer");
const uploadController = require("../controllers/uploadController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Route để upload avatar
router.post("/avatar", upload.single("avatar"), uploadController.uploadAvatar);


module.exports = router;