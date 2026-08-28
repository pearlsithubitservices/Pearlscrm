const express = require("express");
const multer = require("multer");
const { protect } = require("../middlewares/authMiddleware");
const { getProfile, updateProfile, uploadDocument, uploadAvatar, deleteDocument } = require("../controllers/profileController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);
router.get("/", getProfile);
router.put("/", updateProfile);
router.post("/avatar", upload.single("file"), uploadAvatar);
router.post("/documents", upload.single("file"), uploadDocument);
router.delete("/documents/:documentType", deleteDocument);

module.exports = router;