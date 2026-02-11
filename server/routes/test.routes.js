import express from "express";
import multer from "multer";
import { uploadToR2 } from "../utils/r2Upload.js";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/r2-test", upload.single("file"), async (req, res) => {
  try {
    const result = await uploadToR2({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      folder: "test",
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
