const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goalController");
const auth = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/') 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

router.get("/", auth, goalController.getGoals);
router.post("/", auth, upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), goalController.addGoal);
router.delete("/:id", auth, goalController.deleteGoal);

module.exports = router;
