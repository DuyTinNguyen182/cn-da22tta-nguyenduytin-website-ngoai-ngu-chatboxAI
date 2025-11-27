const Contact = require("../models/Contact");

const createContact = async (data) => {
  const { fullname, email, phone, content } = data;

  const newContact = new Contact({
    fullname,
    email,
    phone,
    content,
  });

  return await newContact.save();
};

const getAllContacts = async () => {
  return await Contact.find().sort({ createdAt: -1 });
};

const deleteContact = async (id) => {
  return await Contact.findByIdAndDelete(id);
};

const updateContactStatus = async (id, status) => {
  return await Contact.findByIdAndUpdate(id, { status }, { new: true });
};

module.exports = {
  createContact,
  getAllContacts,
  deleteContact,
  updateContactStatus,
};
