const axios = require("axios");
const Chat = require("../../models/chat.model");
const Tour = require("../../models/tour.model");
const CachedResponse = require("../../models/CachedResponse");

const invalidTopics = [
    "bóng đá", "bóng rổ", "bóng chuyền", "tennis", "cầu lông", "võ thuật", "thể thao",
    "công nghệ", "lập trình", "máy tính", "ai", "trí tuệ nhân tạo", "robot", "phần mềm", "phần cứng",
    "âm nhạc", "ca sĩ", "nhạc sĩ", "bài hát", "bản nhạc", "rap", "phim", "diễn viên", "truyền hình", "showbiz", "ca nhạc", "manga", "anime", "truyện tranh", "game", "trò chơi",
    "nấu ăn", "món ăn", "ẩm thực", "bếp núc", "công thức", "đầu bếp",
    "toán học", "vật lý", "hóa học", "sinh học", "khoa học", "lịch sử", "địa lý", "ngôn ngữ", "văn học", "giáo dục",
    "xe máy", "ô tô", "xe cộ", "phương tiện", "xe đạp", "xe tải", "mô tô",
    "chính trị", "tôn giáo", "chiến tranh", "biểu tình", "xã hội", "pháp luật", "chứng khoán", "tiền điện tử", "bitcoin", "crypto",
    "tập gym", "chạy bộ", "sức khỏe", "dinh dưỡng", "bệnh", "thuốc", "bác sĩ", "y tế", "thể hình", "chế độ ăn",
    "tình yêu", "người yêu", "bạn trai", "bạn gái", "tâm sự", "mối quan hệ",
    "bạn là ai", "tên bạn là gì", "ai tạo ra bạn", "openai", "chatgpt", "nguồn dữ liệu", "tự học"
];

function extractMonthFromMessage(message) {
    const lower = message.toLowerCase();
    const monthMatch = lower.match(/tháng (\d{1,2})/);
    if (monthMatch) {
        const parsed = parseInt(monthMatch[1]);
        if (parsed >= 1 && parsed <= 12) return parsed;
    }

    if (lower.includes("tháng sau")) {
        const now = new Date();
        return ((now.getMonth() + 1) % 12) + 1;
    }

    return null;
}


function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

module.exports.getChatResponse = async (req, res) => {
    try {
        const { message } = req.body;
        const isLoggedIn = !!req.user;
        const userId = isLoggedIn ? req.user._id : null;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Danh sách chủ đề bị chặn
        const normalizedMsg = normalizeText(message);
        if (invalidTopics.some(topic => normalizedMsg.includes(normalizeText(topic)))) {
            return res.json({ reply: "Mình chỉ hỗ trợ về du lịch thôi nhé! 🚀" });
        }
        // Check cache trước
        const allCached = await CachedResponse.find({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // 30 ngày
        });

        const match = allCached.find(item =>
            stringSimilarity.compareTwoStrings(item.question, message) > 0.85
        );

        if (match) {
            return res.json({ reply: match.answer });
        }

        // Gợi ý tour
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        let suggestedTours = "";
        const tours = await Tour.find().limit(5).select("title price");
        if (tours.length > 0) {
            suggestedTours = "Dưới đây là một số tour bạn có thể tham khảo:\n" +
                tours.map(tour => `- ${tour.title} (${tour.price} VND)`).join("\n");
        }

        const extractedMonth = extractMonthFromMessage(message);
        const targetMonth = extractedMonth || (new Date().getMonth() + 1);

        const systemPrompt = {
            role: "system",
            content: `Bạn là trợ lý du lịch.Hãy dựa vào tháng ${targetMonth}/${year} để trả lời nhé!.
            Chỉ sử dụng thông tin tôi cung cấp để gợi ý điểm đến, lịch trình và mẹo du lịch. Trả lời thật ngắn gọn và súc tích.
            Không lấy thông tin bên ngoài, không nhắc đến thương hiệu hay website.\n${suggestedTours}`
        };

        let messages = [systemPrompt, { role: "user", content: message }];

        if (isLoggedIn) {
            let chat = await Chat.findOne({ userId });
            if (!chat) chat = new Chat({ userId, history: [] });

            chat.history.push({ role: "user", content: message });
            messages = [systemPrompt, ...chat.history];
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-r1:free",
                messages: messages,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "GoTravel",
                    "Content-Type": "application/json",
                },
            }
        );

        const reply = response.data.choices?.[0]?.message?.content || "No response received.";

        // Lưu cache
        await CachedResponse.create({
            question: message,
            answer: reply
        });

        if (isLoggedIn) {
            const chat = await Chat.findOne({ userId });
            chat.history.push({ role: "assistant", content: reply });
            await chat.save();
        }

        return res.json({ reply });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Có lỗi xảy ra!" });
    }
};

// [PATCH]/api/v1/chats/clear
module.exports.clearChat = async (req, res) => {
    try {
        const userId = req.user._id;
        await Chat.updateOne({
            userId: userId
        }, {
            $set: {
                history: []
            }
        });
        res.json({
            code: 200,
            message: "Xóa lịch sử trò chuyện thành công!"
        });
    } catch (error) {
        res.json({
            code: 500,
            message: error
        });
    }
}