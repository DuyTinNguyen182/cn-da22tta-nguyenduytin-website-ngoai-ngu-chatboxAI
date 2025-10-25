const userService = require("../services/userService");

const getAllUsers = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserById = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ message: "Invalid user ID format" });
    const user = await userService.getUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getCurrentUser(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteUsersByIds = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { userIds } = req.body;
    if (
      !Array.isArray(userIds) ||
      userIds.some((id) => !id.match(/^[0-9a-fA-F]{24}$/))
    )
      return res.status(400).json({ message: "Invalid user IDs format" });
    const result = await userService.deleteUsersByIds(userIds);
    if (!result)
      return res.status(404).json({ message: "One or more users not found" });
    res.json({ message: "Users deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUserById = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ message: "Invalid user ID format" });

    const { fullname } = req.body;
    if (fullname && /[^a-zA-ZÀ-ỹ\s]/.test(fullname)) {
      return res.status(400).json({ message: "Họ tên không hợp lệ" });
    }

    const { address } = req.body;
    if (address && /[^a-zA-ZÀ-ỹ,/0-9\s]/.test(address)) {
      return res.status(400).json({ message: "Địa chỉ không hợp lệ" });
    }

    const user = await userService.updateUserById(id, req.body);
    if (!user)
      return res
        .status(400)
        .json({ message: "Bạn chỉ được phép sửa giới tính 1 lần duy nhất!" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getCurrentUser,
  deleteUsersByIds,
  updateUserById,
};
