const Chat = require("../models/Chat");
const { GoogleGenAI } = require("@google/genai");

exports.getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user.userId }).sort({ createdAt: 1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: "Error fetching chats" });
    }
};

exports.analyze = async (req, res) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { expenses, query } = req.body;

        const prompt = `
        You are a financial advisor. The user has the following expense data:
        ${JSON.stringify(expenses)}
        
        The user asks: "${query}"
        
        Provide a very short, helpful response (max 3 sentences) in plain text or simple markdown.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const aiResponse = response.text;

        const chat = new Chat({ userId: req.user.userId, query, response: aiResponse });
        await chat.save();

        res.json({ result: aiResponse });
    } catch (error) {
        res.status(500).json({ error: "Error connecting to AI" });
    }
};

exports.advancedSummary = async (req, res) => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { expenses } = req.body;

        const prompt = `
        You are a professional financial advisor.
        Here is the user's transaction data: ${JSON.stringify(expenses)}
        Please generate a professional "Monthly Financial Summary".
        Highlight:
        1. Biggest spending category.
        2. Where they can save money.
        3. A quick personalized tip.
        Format beautifully in Markdown.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        res.json({ result: response.text });
    } catch (error) {
        res.status(500).json({ error: "Error generating summary" });
    }
};
