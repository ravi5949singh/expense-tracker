const Expense = require("../models/Expense");

exports.addExpense = async (req, res) => {
    try {
        const { description, amount, category, paymentMethod, type, date } = req.body;
        if (!description || !amount || !category || !date) {
            return res.status(400).json({ error: "Required fields missing" });
        }
        
        const expense = new Expense({
            userId: req.user.userId,
            description, amount, category, paymentMethod, type, date: new Date(date)
        });
        await expense.save();
        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: "Error saving transaction" });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        // Pagination & Filtering
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        let query = { userId: req.user.userId };
        
        if (req.query.search) {
            query.description = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.category && req.query.category !== 'All') {
            query.category = req.query.category;
        }

        const expenses = await Expense.find(query).sort({ date: -1 }).skip(skip).limit(limit);
        const total = await Expense.countDocuments(query);

        // Also send ALL expenses for the dashboard charts/analytics (in a real app, you'd aggregate this on the backend)
        const allExpenses = await Expense.find({ userId: req.user.userId }).sort({ date: -1 });

        res.json({
            expenses,
            allExpenses, // Need this for frontend charts right now
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching transactions" });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting transaction" });
    }
};
