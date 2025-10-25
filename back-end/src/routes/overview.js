const express = require("express");
const { getStats, getRevenueStats, } = require("../controllers/overviewController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stats", authenticate, getStats);
router.get("/revenue-stats", authenticate, getRevenueStats);

module.exports = router;
