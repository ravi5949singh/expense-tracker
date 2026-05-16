const mongoose = require("mongoose");
const goalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    photoUrl: { type: String },
    audioUrl: { type: String },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Goal", goalSchema);
