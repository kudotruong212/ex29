const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyUser } = require('../config/jwtConfig');

const uploadRouter = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Keep original extension, generate unique name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to prevent uploading dangerous scripts (js, exe, html, bat, etc.)
const fileFilter = (req, file, cb) => {
  const disallowedExtensions = ['.exe', '.js', '.html', '.htm', '.sh', '.bat', '.cmd', '.php'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (disallowedExtensions.includes(ext)) {
    return cb(new Error('Dangerous file types are not allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  },
  fileFilter: fileFilter
});

// Helper function to format the file URL
function getFileUrl(req, filename) {
  const protocol = req.encrypted || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filename}`;
}

// @route   POST /upload/single
// @desc    Upload a single file
// @access  Private (verifyUser)
uploadRouter.post('/single', verifyUser, function (req, res) {
  upload.single('file')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const fileUrl = getFileUrl(req, req.file.filename);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  });
});

// @route   POST /upload/multiple
// @desc    Upload multiple files (up to 5)
// @access  Private (verifyUser)
uploadRouter.post('/multiple', verifyUser, function (req, res) {
  upload.array('files', 5)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please upload at least one file' });
    }

    const uploadedFiles = req.files.map(file => ({
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      url: getFileUrl(req, file.filename)
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  });
});

module.exports = uploadRouter;
