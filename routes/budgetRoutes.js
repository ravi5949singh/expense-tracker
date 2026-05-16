const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const auth = require("../middleware/auth");

router.get("/", auth, budgetController.getBudget);
router.post("/", auth, budgetController.setBudget);

module.exports = router;
