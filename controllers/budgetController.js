const Budget = require("../models/Budget");

exports.getBudget = async (req, res) => {
    try {
        let budget = await Budget.findOne({ userId: req.user.userId });
        if(!budget) {
            budget = new Budget({ userId: req.user.userId, amount: 50000 });
            await budget.save();
        }
        res.json(budget);
    } catch (err) {
        res.status(500).json({ error: "Error fetching budget" });
    }
};

exports.setBudget = async (req, res) => {
    try {
        const { amount } = req.body;
        let budget = await Budget.findOne({ userId: req.user.userId });
        if(budget) {
            budget.amount = amount;
            budget.updatedAt = Date.now();
            await budget.save();
        } else {
            budget = new Budget({ userId: req.user.userId, amount });
            await budget.save();
        }
        res.json(budget);
    } catch (err) {
        res.status(500).json({ error: "Error saving budget" });
    }
};
