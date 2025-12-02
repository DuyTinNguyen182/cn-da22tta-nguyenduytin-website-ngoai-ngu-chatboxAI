const chatbotService = require("../services/chatbotService");

const handleAsk = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Gọi Service xử lý logic
    const result = await chatbotService.processUserMessage(message);

    // Trả kết quả về client
    res.json(result);
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ error: "Lỗi hệ thống AI" });
  }
};

module.exports = { handleAsk };
