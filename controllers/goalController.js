const Goal = require("../models/Goal");

exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ error: "Error fetching goals" });
    }
};

exports.addGoal = async (req, res) => {
    try {
        const { title } = req.body;
        const newGoal = new Goal({ userId: req.user.userId, title });
        
        if (req.files && req.files['photo']) {
            newGoal.photoUrl = '/uploads/' + req.files['photo'][0].filename;
        }
        if (req.files && req.files['audio']) {
            newGoal.audioUrl = '/uploads/' + req.files['audio'][0].filename;
        }

        await newGoal.save();
        res.json(newGoal);
    } catch (err) {
        res.status(500).json({ error: "Error saving goal" });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        res.json({ message: "Deleted Goal ✅" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting goal" });
    }
};
