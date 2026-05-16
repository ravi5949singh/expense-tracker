const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    query: { type: String, required: true },
    response: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Chat", chatSchema);
