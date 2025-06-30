const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Initialize upload directories
ensureDirectoryExists('./uploads/products');
ensureDirectoryExists('./uploads/categories');
ensureDirectoryExists('./uploads/tickets');
ensureDirectoryExists('./uploads/temp');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/temp';
    
    if (req.route.path.includes('products')) {
      uploadPath = './uploads/products';
    } else if (req.route.path.includes('categories')) {
      uploadPath = './uploads/categories';
    } else if (req.route.path.includes('tickets')) {
      uploadPath = './uploads/tickets';
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    all: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'text/plain']
  };

  let allowed = allowedTypes.all;
  
  if (req.route.path.includes('products') || req.route.path.includes('categories')) {
    allowed = allowedTypes.images;
  }

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.files && !req.file) {
    return next();
  }

  try {
    const files = req.files || [req.file];
    const processedFiles = [];

    for (const file of files) {
      if (file.mimetype.startsWith('image/')) {
        const filename = file.filename;
        const inputPath = file.path;
        const outputPath = path.join(path.dirname(inputPath), `processed-${filename}`);

        // Process image with sharp
        await sharp(inputPath)
          .resize(800, 800, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 85,
            progressive: true 
          })
          .toFile(outputPath);

        // Replace original with processed image
        fs.unlinkSync(inputPath);
        fs.renameSync(outputPath, inputPath);

        // Create thumbnail
        const thumbnailPath = path.join(path.dirname(inputPath), `thumb-${filename}`);
        await sharp(inputPath)
          .resize(200, 200, { 
            fit: 'cover' 
          })
          .jpeg({ 
            quality: 80 
          })
          .toFile(thumbnailPath);

        processedFiles.push({
          ...file,
          thumbnailPath: thumbnailPath.replace('./uploads/', '/uploads/')
        });
      } else {
        processedFiles.push(file);
      }
    }

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(error);
  }
};

// Clean up temporary files
const cleanupTempFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', filePath, error);
    }
  });
};

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 10 files.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected file field.' });
    }
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({ message: error.message });
  }

  next(error);
};

// Specific upload configurations
const uploadConfigs = {
  // Single image upload (for categories, profile pictures)
  single: (fieldName) => [
    upload.single(fieldName),
    handleUploadError,
    processImage
  ],
  
  // Multiple images upload (for products)
  multiple: (fieldName, maxCount = 5) => [
    upload.array(fieldName, maxCount),
    handleUploadError,
    processImage
  ],
  
  // Mixed upload (for tickets - images and documents)
  mixed: (fields) => [
    upload.fields(fields),
    handleUploadError,
    processImage
  ]
};

module.exports = {
  upload,
  processImage,
  cleanupTempFiles,
  handleUploadError,
  uploadConfigs
};