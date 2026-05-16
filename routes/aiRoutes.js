const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const auth = require("../middleware/auth");

router.get("/chats", auth, aiController.getChats);
router.post("/analyze", auth, aiController.analyze);
router.post("/summary", auth, aiController.advancedSummary);

module.exports = router;
