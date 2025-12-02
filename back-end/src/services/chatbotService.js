const { OpenAI } = require("openai");
const Course = require("../models/Course");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- TOOLS ---
const tools = [
  {
    type: "function",
    function: {
      name: "search_courses",
      description:
        "Tìm kiếm khóa học trong database. Dùng khi người dùng hỏi: danh sách khóa học, học phí, thời gian học, ngày khai giảng, khóa học sắp diễn ra, lớp mới hoặc có liên quan.",
      parameters: {
        type: "object",
        properties: {
          keyword: {
            type: "string",
            description: "Từ khóa liên quan đến khóa học.",
          },
        },
        required: ["keyword"],
      },
    },
  },
];

const processUserMessage = async (message) => {
  const todayStr = new Date().toLocaleDateString("vi-VN");

  // Chat system prompt
  const conversation = [
    {
      role: "system",
      content: `Bạn là trợ lý ảo của trung tâm DREAM. Hôm nay là ngày ${todayStr}. 
          Bạn sẽ giúp tìm khóa học phù hợp khi người dùng yêu cầu. 
          - Lưu ý quan trọng: Dựa vào ngày bắt đầu của khóa học so với hôm nay (${todayStr}) để dùng thì cho đúng: 
          + Nếu ngày bắt đầu ở quá khứ: Dùng "đã bắt đầu", "đã kết thúc" hoặc "đang diễn ra". 
          + Nếu ngày bắt đầu ở tương lai: Dùng "sẽ khai giảng".
          * Tuyệt đối không đọc lại dữ liệu, chỉ tổng hợp số lượng hay ngày tháng (nếu hỏi thời gian khóa học). 
          - Luôn thân thiện, xưng 'em' và gọi khách là 'anh/chị'.`,
    },
    { role: "user", content: message },
  ];

  // --- STEP 1: AI phân tích ---
  const firstRunner = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: conversation,
    tools: tools,
    tool_choice: "auto",
  });

  const response = firstRunner.choices[0].message;

  // --- STEP 2: Nếu AI gọi search_courses ---
  if (response.tool_calls) {
    const toolCall = response.tool_calls[0];
    let args = {};
    try {
      args = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error("Lỗi parse arguments:", e);
    }

    const keyword = args.keyword || "";
    console.log("AI tìm kiếm với keyword:", keyword);

    const courses = await Course.find()
      .populate("language_id")
      .populate("languagelevel_id")
      .populate("teacher_id");

    let filtered = courses;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lowerKeyword = keyword.toLowerCase();

    const timeKeywords = [
      "sắp",
      "gần",
      "tới",
      "chuẩn bị",
      "upcoming",
      "khai giảng",
      "mở",
      "mới",
    ];
    const isUpcoming = timeKeywords.some((w) => lowerKeyword.includes(w));

    if (keyword.trim() !== "") {
      // 1. Kiểm tra ý định tìm Giáo viên
      const teacherIntents = ["gv", "giáo viên", "thầy", "cô"];
      const hasTeacherIntent = teacherIntents.some((t) =>
        lowerKeyword.includes(t)
      );

      // 2. Làm sạch từ khóa
      let cleanKeyword = lowerKeyword
        .replace(
          /(khóa học|lớp|giá|học phí|tìm|cho mình|tôi muốn|hỏi|về|có|không|trình độ|của|là|bao nhiêu|trong|bao lâu)/g,
          " "
        )
        .trim();

      if (hasTeacherIntent) {
        cleanKeyword = cleanKeyword
          .replace(/(gv|giáo viên|thầy|cô)/g, "")
          .trim();
      }

      const searchTerms = cleanKeyword.split(/\s+/).filter((t) => t.length > 0);

      filtered = filtered.filter((c) => {
        // 3. Xây dựng phạm vi tìm kiếm
        // Mặc định: Ngôn ngữ + Trình độ + Mã khóa
        let searchScope = `${c.language_id?.language} ${c.languagelevel_id?.language_level} ${c.courseid}`;

        //Nếu tìm giáo viên -> Thêm tên giáo viên vào phạm vi tìm kiếm
        if (hasTeacherIntent) {
          searchScope += ` ${c.teacher_id?.full_name}`;
        }

        const normalizedScope = searchScope
          .toLowerCase()
          .replace(/[^\w\sà-ỹ0-9]/g, " ");

        // 4. So sánh: Phải chứa tất cả từ khóa quan trọng
        return searchTerms.every((term) => {
          const regex = new RegExp(`(^|\\s)${term}($|\\s)`, "i");
          return regex.test(normalizedScope);
        });
      });
    }

    if (isUpcoming) {
      filtered = filtered.filter((c) => new Date(c.Start_Date) >= today);
    }

    filtered.sort((a, b) => {
      if (new Date(a.Start_Date) >= today && new Date(b.Start_Date) >= today) {
        return new Date(a.Start_Date) - new Date(b.Start_Date);
      }

      return new Date(b.Start_Date) - new Date(a.Start_Date);
    });

    filtered = filtered.slice(0, 4);

    const courseDataForAI = filtered.map((c) => {
      const teacherName = c.teacher_id?.full_name || "Đang cập nhật";
      const gender = c.teacher_id?.gender;

      let teacherWithTitle = teacherName;
      if (gender === "Nam") {
        teacherWithTitle = `Thầy ${teacherName}`;
      } else if (gender === "Nữ") {
        teacherWithTitle = `Cô ${teacherName}`;
      }

      return {
        id: c._id,
        name: `${c.language_id?.language} - ${c.languagelevel_id?.language_level}`,
        teacher: teacherWithTitle,
        price: c.discounted_price || c.Tuition,
        duration: `${c.Number_of_periods} tiết`,
        startDate: new Date(c.Start_Date).toLocaleDateString("vi-VN"),
        end_date: new Date(c.end_date).toLocaleDateString("vi-VN"),
        status: c.status,
        discount_percent: c.discount_percent,
        discounted_price: c.discounted_price,
        Tuition: c.Tuition,
      };
    });

    // Nếu không tìm thấy khóa nào
    if (filtered.length === 0) {
      conversation.push(response);
      conversation.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: "search_courses",
        content: JSON.stringify({
          message: "Không tìm thấy khóa học nào khớp với từ khóa.",
        }),
      });
    } else {
      conversation.push(response);
      conversation.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: "search_courses",
        content: JSON.stringify(courseDataForAI),
      });
    }

    const secondRunner = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversation,
    });

    return {
      type: "course_list",
      reply: secondRunner.choices[0].message.content,
      data: filtered.length > 0 ? filtered : null, // Chỉ trả về data để hiển thị bảng nếu có kết quả
    };
  }

  // --- Chat bình thường ---
  return {
    type: "text",
    reply: response.content,
  };
};

module.exports = { processUserMessage };
