const mongoose = require("mongoose");
const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    paymentMethod: { type: String, default: "Cash" },
    type: { type: String, enum: ['expense', 'income'], default: 'expense' },
    date: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Expense", expenseSchema);
