const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const handleAsk = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Hoặc "gpt-4" nếu bạn có quyền truy cập
            messages: [
                // System Prompt: "Dạy" cho AI biết nó là ai
                { 
                    role: "system", 
                    content: "Bạn là một trợ lý ảo am hiểu của trung tâm ngoại ngữ DREAM. Hãy trả lời các câu hỏi của học viên về các khóa học, lịch học, và các thông tin liên quan một cách thân thiện và chuyên nghiệp." 
                },
                // User's message
                { 
                    role: "user", 
                    content: message 
                }
            ],
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        res.status(500).json({ error: "Không thể kết nối với trợ lý AI" });
    }
};

module.exports = { handleAsk };