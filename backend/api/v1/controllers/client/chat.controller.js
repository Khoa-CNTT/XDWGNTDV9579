const axios = require("axios");
const stringSimilarity = require("string-similarity");
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
    const now = new Date();

    const monthMatch = lower.match(/tháng (\d{1,2})/);
    if (monthMatch) {
        const parsed = parseInt(monthMatch[1]);
        if (parsed >= 1 && parsed <= 12) return parsed;
    }

    // "tháng sau"
    if (lower.includes("tháng sau")) {
        return ((now.getMonth() + 1) % 12) + 1;
    }

    // "tháng này"
    if (lower.includes("tháng này")) {
        const day = now.getDate();
        const bufferDays = 2;

        if (day <= bufferDays) {
            const adjustedDate = new Date(now.getFullYear(), now.getMonth() - 1);
            return adjustedDate.getMonth() + 1;
        }

        return now.getMonth() + 1;
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


        const suggestWebsiteKeywords = [
            "giới thiệu website du lịch",
            "trang web du lịch",
            "website du lịch nào",
            "web du lịch",
            "cho tôi một trang du lịch",
            "tư vấn website du lịch",
            "giới thiệu trang web về du lịch",
            "có trang web du lịch nào không",
            "Giới thiệu cho tôi về 1 web du lịch"
        ];

        const isSuggestingWebsite = suggestWebsiteKeywords.some(keyword =>
            normalizedMsg.includes(normalizeText(keyword))
        );

        if (isSuggestingWebsite) {
            return res.json({
                reply: "Bạn có thể truy cập website chính thức của chúng tôi  để khám phá các tour du lịch hấp dẫn nhé! 🌍✨"
            });
        }

        // Check cache trước
        const allCached = await CachedResponse.find({
            createdAt: { $gte: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) }
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
        const tours = await Tour.find().select("title price");
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
            Không lấy thông tin bên ngoài.Chỉ lấy thông tin website GoTravel của chúng tôi.\n${suggestedTours}`
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