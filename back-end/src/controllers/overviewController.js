const {
  getOverviewStats,
  getRevenueOverTime,
} = require("../services/overviewService");

const getStats = async (req, res) => {
  try {
    const { range } = req.query; // Lấy 'range' từ query param
    const stats = await getOverviewStats(range);
    res.status(200).json(stats);
  } catch (error) {
    // ...
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const { range } = req.query; // Lấy 'range' từ query param
    const stats = await getRevenueOverTime(range);
    res.status(200).json(stats);
  } catch (error) {
    // ...
  }
};

module.exports = {
  getStats,
  getRevenueStats,
};
