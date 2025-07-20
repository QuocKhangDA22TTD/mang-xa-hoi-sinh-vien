// routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Nếu cần bảo vệ route, bật dòng này
// const verifyToken = require('../middleware/verifyToken');

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Lưu trong thư mục uploads/
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Controller upload ảnh
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file được tải lên' });
  }

  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
};

// Route POST /api/upload (nếu muốn bảo vệ bằng token thì thêm verifyToken vào trước)
router.post('/', upload.single('image'), uploadImage);

module.exports = router;
