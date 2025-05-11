const axios = require("axios");
const Chat = require("../../models/chat.model");
const Tour = require("../../models/tour.model");

// [POST]/api/v1/chats
module.exports.getChatResponse = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        let chat = await Chat.findOne({ userId });
        if (!chat) {
            chat = new Chat({ userId, history: [] });
        }

        chat.history.push({ role: "user", content: message });

        const invalidTopics = ["bóng đá", "công nghệ", "nấu ăn", "toán học", "xe cộ"];
        if (invalidTopics.some(topic => message.toLowerCase().includes(topic))) {
            return res.json({ reply: "Mình chỉ hỗ trợ về du lịch thôi nhé! 🚀" });
        }

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        let suggestedTours = "";
        const tours = await Tour.find();

        if (tours.length > 0) {
            suggestedTours = "Dưới đây là một số tour bạn có thể tham khảo:\n" +
                tours.map(tour => `- ${tour.title} (${tour.price} VND)`).join("\n");
        }

        const messages = [
            {
                role: "system",
                content: `Bạn là trợ lý du lịch. Tháng ${month}/${year}. 
                Chỉ sử dụng thông tin tôi cung cấp để gợi ý điểm đến, lịch trình và mẹo du lịch. Trả lời thật ngắn gọn và súc tích.
                Không lấy thông tin bên ngoài, không nhắc đến thương hiệu hay website.\n${suggestedTours}`
            },
            ...chat.history,
        ];

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-r1:free",
                messages,
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
        chat.history.push({ role: "assistant", content: reply });
        await chat.save();

        res.json({ reply });
    } catch (error) {
        console.error("Error calling OpenRouter API:", error);
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