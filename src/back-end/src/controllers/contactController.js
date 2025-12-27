const contactService = require("../services/contactService");

const createContact = async (req, res) => {
  try {
    const { fullname, email, content } = req.body;

    if (!fullname || !email || !content) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin bắt buộc." });
    }

    const result = await contactService.createContact(req.body);

    res.status(201).json({
      message: "Gửi liên hệ thành công!",
      contact: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await contactService.getAllContacts();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await contactService.deleteContact(id);
    res.status(200).json({ message: "Đã xóa liên hệ thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await contactService.updateContactStatus(id, status);

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy liên hệ" });
    }

    res.status(200).json({ message: "Cập nhật thành công", contact: updated });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  deleteContact,
  updateContactStatus,
};
