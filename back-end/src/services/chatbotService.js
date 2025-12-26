const { OpenAI } = require("openai");
const Course = require("../models/Course");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- THÊM ĐOẠN NÀY: KHỞI TẠO BỘ NHỚ TẠM ---
const chatSessions = new Map(); // Lưu trữ: sessionId -> [messages]

// Hàm dọn dẹp bộ nhớ định kỳ (tránh tràn RAM)
setInterval(() => {
  chatSessions.clear();
  console.log("--- Đã reset bộ nhớ chat tạm thời ---");
}, 24 * 60 * 60 * 1000); // 24h dọn 1 lần

// Hàm cập nhật lịch sử chat (Chỉ giữ 6 tin gần nhất = 3 cặp hỏi đáp)
const updateHistory = (sessionId, userMsg, assistantMsg) => {
  let currentHistory = chatSessions.get(sessionId) || [];
  currentHistory.push({ role: "user", content: userMsg });
  currentHistory.push({ role: "assistant", content: assistantMsg });

  if (currentHistory.length > 6) {
    currentHistory = currentHistory.slice(-6);
  }
  chatSessions.set(sessionId, currentHistory);
};

// --- DỮ LIỆU THAM CHIẾU ---
// Menu để AI biết trung tâm có gì mà map dữ liệu
const REFERENCE_DATA = `
DANH MỤC KHÓA HỌC HIỆN CÓ TẠI TRUNG TÂM DREAM:
1. Tiếng Anh: Hệ CEFR (A1, A2, B1, B2, C1, C2).
2. Tiếng Trung: Hệ HSK (HSK 1 đến HSK 6).
3. Tiếng Nhật: Hệ JLPT (N5, N4, N3, N2, N1).
4. Tiếng Hàn: Hệ TOPIK (TOPIK 1 đến TOPIK 6).
5. Tiếng Pháp/Đức: Hệ CEFR (A1, A2, B1, B2).
6. Các ngôn ngữ khác (Ý, Nga, Tây Ban Nha, Bồ Đào Nha): Hệ CEFR (A1, A2).

LƯU Ý QUAN TRỌNG: 
- Trung tâm KHÔNG dạy tên các chứng chỉ quốc tế như IELTS, TOEIC, VSTEP.
- Nếu khách hỏi IELTS/TOEIC/Du học -> Tự động quy đổi sang hệ CEFR (Tiếng Anh) tương đương.
- Nếu khách hỏi Xuất khẩu lao động/Giao tiếp -> Tự động quy đổi sang cấp độ sơ-trung cấp tương ứng (A2/B1 hoặc N4/N3, Topik 2/3).
`;

// --- TOOLS ---
const tools = [
  {
    type: "function",
    function: {
      name: "search_courses",
      description:
        "Tìm kiếm khóa học trong Database. BẮT BUỘC DÙNG khi khách hỏi về học tập.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description:
              "Từ khóa tìm kiếm BẮT BUỘC PHẢI BAO GỒM: [Tên Ngôn Ngữ] + [Trình độ]. Ví dụ: 'Tiếng Nga A2', 'Tiếng Anh B1'. KHÔNG ĐƯỢC chỉ điền mỗi trình độ như 'A2' hay 'B1'.",
          },
        },
        required: ["keyword"],
      },
    },
  },
];

const processUserMessage = async (message, sessionId) => {
  const todayStr = new Date().toLocaleDateString("vi-VN");

  // --- THÊM ĐOẠN NÀY: Lấy lịch sử cũ ---
  // Nếu không có sessionId (trường hợp lỗi), dùng mảng rỗng
  const history = sessionId ? chatSessions.get(sessionId) || [] : [];

  // --- SYSTEM PROMPT ---
  const conversation = [
    {
      role: "system",
      content: `Bạn là Chuyên gia Tư vấn Giáo dục của DREAM (Ngày: ${todayStr}).
      
      ### DỮ LIỆU THAM CHIẾU:
      ${REFERENCE_DATA}

      ### QUY TẮC XỬ LÝ (QUAN TRỌNG NHẤT):
      1. Nhiệm vụ ưu tiên số 1: Nhận diện nhu cầu học tập của khách -> **GỌI TOOL NGAY LẬP TỨC**.
      2. **TUYỆT ĐỐI KHÔNG NÓI GÌ** (kể cả câu chào hay câu "đợi chút") trước khi gọi tool.
      3. **CẤM** in ra các dòng chữ dạng "Call Tool:...", "Function...", "Action...". Việc gọi tool phải được thực hiện ngầm qua hệ thống.

      ### SUY LUẬN TỪ KHÓA (LOGIC):
      - Khách muốn Du học/Định cư -> Cần chứng chỉ quốc tế -> Quy đổi sang khóa tương đương (VD: Anh B2, Hàn Topik 2...).
      - Khách muốn Giải trí/Giao tiếp -> Cần trình độ sơ-trung cấp -> Quy đổi sang khóa cơ bản (VD: Nhật N4, Anh A2...).

      ### BẢNG CẤM KỴ (CHECK KỸ TRƯỚC KHI TẠO KEYWORD):
      - Tiếng HÀN: CHỈ ĐƯỢC DÙNG "Topik". CẤM dùng "N3", "A2", "HSK". (Sai: Tiếng Hàn N3 -> Đúng: Tiếng Hàn Topik 2).
      - Tiếng NHẬT: CHỈ ĐƯỢC DÙNG "N". CẤM dùng "Topik". (Sai: Tiếng Nhật A2 -> Đúng: Tiếng Nhật N4).
      - Tiếng TRUNG: CHỈ ĐƯỢC DÙNG "HSK".
      - Tiếng ANH/PHÁP/ĐỨC/NGA/TÂY BAN NHA/BỒ ĐÀO NHA: CHỈ ĐƯỢC DÙNG hệ A, B, C (CEFR). 

      ### VÍ DỤ MẪU (HÃY HỌC CÁCH HÀNH ĐỘNG, ĐỪNG HỌC VẸT VĂN BẢN):

      User: "Tôi muốn học để đi du học Đức"
      Assistant: (Hành động ngầm: Gọi tool search_courses với keyword="Tiếng Đức B1" hoặc "Tiếng Đức B2")
      
      User: "Có lớp tiếng Hàn nào sắp mở không?"
      Assistant: (Hành động ngầm: Gọi tool search_courses với keyword="Tiếng Hàn")

      User: "Em muốn xem phim Nhật không cần sub"
      Assistant: (Hành động ngầm: Gọi tool search_courses với keyword="Tiếng Nhật N3")

      ### LUÔN XƯNG EM, GỌI KHÁCH LÀ anh/chị.
      `,
    },
    ...history,
    { role: "user", content: message },
  ];

  // --- STEP 1: Gọi AI ---
  const firstRunner = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: conversation,
    tools: tools,
    tool_choice: "auto",
    temperature: 0,
  });

  const response = firstRunner.choices[0].message;

  // --- STEP 2: Xử lý Tool Call ---
  if (response.tool_calls) {
    const toolCall = response.tool_calls[0];
    let args = {};
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Lỗi parse arguments:", e);
    }

    const keyword = args.keyword || "";
    console.log("LOG: AI suy luận và tìm kiếm với keyword:", keyword);

    // 1. Lấy dữ liệu từ DB
    const courses = await Course.find()
      .populate("language_id")
      .populate("languagelevel_id")
      .populate("teacher_id");

    let filtered = courses;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Logic Filter
    const lowerKeyword = keyword.toLowerCase().trim();
    const teacherIntents = ["gv", "giáo viên", "thầy", "cô"];
    const hasTeacherIntent = teacherIntents.some((t) =>
      lowerKeyword.includes(t)
    );
    const isUpcoming = ["sắp", "tới", "khai giảng", "mới"].some((w) =>
      lowerKeyword.includes(w)
    );

    if (lowerKeyword !== "") {
      const searchTerms = lowerKeyword
        .split(/\s+/)
        .filter((t) => t.length > 0 && t !== "tiếng");

      filtered = filtered.filter((c) => {
        const lang = c.language_id?.language || "";
        const levelName = c.languagelevel_id?.language_level || "";
        const levelCode = c.languagelevel_id?.language_levelid || "";
        const teacherName = c.teacher_id?.full_name || "";
        // BƯỚC 1: Tạo scope tìm kiếm
        let searchScope = `${lang} ${levelName} ${levelCode}`;
        if (hasTeacherIntent) {
          searchScope += ` ${teacherName}`;
        }
        const normalizedScope = searchScope.toLowerCase();

        // BƯỚC 2: Kiểm tra
        return searchTerms.every((term) => {
          return normalizedScope.includes(term);
        });
      });
    }

    // 3. Sắp xếp kết quả
    if (isUpcoming) {
      filtered = filtered.filter((c) => new Date(c.Start_Date) >= today);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.Start_Date);
      const dateB = new Date(b.Start_Date);
      if (dateA >= today && dateB >= today) return dateA - dateB;
      if (dateA < today && dateB < today) return dateB - dateA;
      return dateA >= today ? -1 : 1;
    });

    filtered = filtered.slice(0, 4);

    // 4. Chuẩn bị dữ liệu hiển thị
    const courseDataForAI = filtered.map((c) => {
      const teacherName = c.teacher_id?.full_name || "Đang cập nhật";
      const gender = c.teacher_id?.gender;
      let teacherWithTitle =
        gender === "Nam"
          ? `Thầy ${teacherName}`
          : gender === "Nữ"
          ? `Cô ${teacherName}`
          : teacherName;

      return {
        Môn: `${c.language_id?.language} - ${c.languagelevel_id?.language_level}`,
        "Học phí": c.discounted_price
          ? `${c.discounted_price} (Đã giảm)`
          : c.Tuition,
        "Khai giảng": new Date(c.Start_Date).toLocaleDateString("vi-VN"),
        "Giảng viên": teacherWithTitle,
      };
    });

    // --- STEP 3: Phản hồi lại AI ---
    // Push tool call vào history để AI nhớ ngữ cảnh
    conversation.push(response);

    // Push kết quả tìm kiếm
    conversation.push({
      role: "tool",
      tool_call_id: toolCall.id,
      name: "search_courses",
      content: JSON.stringify(
        filtered.length > 0
          ? courseDataForAI
          : { message: "Không tìm thấy lớp phù hợp trong DB." }
      ),
    });

    // *** MAGIC STEP: Ép AI giải thích logic suy luận ***
    // Lúc này đã có kết quả mới cho phép AI giải thích
    conversation.push({
      role: "system",
      content: `Dữ liệu khóa học đã được tìm thấy dựa trên từ khóa "${keyword}" mà bạn suy luận.
      
      NHIỆM VỤ TRẢ LỜI KHÁCH HÀNG:
      1. **Giải thích Logic:** Hãy nói rõ cho khách biết tại sao từ nhu cầu "${message}" bạn lại chọn tìm khóa "${keyword}". (VD: "Anh/chị muốn du học Anh nên cần IELTS ~6.0, tương đương khóa B2 này...").
      2. **Giới thiệu khóa học:** Trình bày thông tin các lớp tìm được.
      3. **Chốt:** Nếu cần thêm thông tin gì hãy hỏi em nhé!
      `,
    });

    // Gọi AI lần 2 để tạo câu trả lời cuối cùng
    const secondRunner = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation,
      temperature: 0.7,
    });

    // --- CẬP NHẬT LỊCH SỬ CHAT ---
    const finalReply = secondRunner.choices[0].message.content;

    // >>> THÊM DÒNG NÀY: Lưu lại cặp hội thoại này vào bộ nhớ <<<
    if (sessionId) updateHistory(sessionId, message, finalReply);

    return {
      type: "course_list",
      reply: secondRunner.choices[0].message.content,
      data: filtered.length > 0 ? filtered : null,
    };
  }

  // --- Chat bình thường (Không gọi tool) ---
  // Lưu lại cặp hội thoại này vào bộ nhớ
  if (sessionId) updateHistory(sessionId, message, response.content);
  return {
    type: "text",
    reply: response.content,
  };
};

module.exports = { processUserMessage };
