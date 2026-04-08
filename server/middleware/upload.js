import multer from "multer";

// ==============================
// STORAGE (MEMORY - for R2 upload)
// ==============================
const storage = multer.memoryStorage();

// ==============================
// FILE FILTER (only images)
// ==============================
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

// ==============================
// LIMITS
// ==============================
const limits = {
  fileSize: 2 * 1024 * 1024, // 2MB
};

// ==============================
// MULTER INSTANCE
// ==============================
const upload = multer({
  storage,
  fileFilter,
  limits,
});

export default upload;
