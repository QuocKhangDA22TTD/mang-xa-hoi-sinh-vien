const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique với timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter để chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  // Kiểm tra loại file
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh!'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Middleware cho upload avatar
const uploadAvatar = upload.single('avatar');

// Middleware cho upload banner
const uploadBanner = upload.single('banner');

// Middleware cho upload cả avatar và banner
const uploadProfileImages = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// Error handler middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File quá lớn! Kích thước tối đa là 5MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Trường file không hợp lệ!'
      });
    }
  }
  
  if (error.message === 'Chỉ cho phép upload file ảnh!') {
    return res.status(400).json({
      message: error.message
    });
  }
  
  next(error);
};

module.exports = {
  uploadAvatar,
  uploadBanner,
  uploadProfileImages,
  handleUploadError
};
