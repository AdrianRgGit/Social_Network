const Multer = require("multer");
const mimetypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

const generateUploadImageMulter = (path) =>
  Multer({
    storage: Multer.diskStorage({
      destination: (req, file, cb) => cb(null, path),
      filename: (req, file, cb) =>
        cb(null, Date.now() + "-" + file.originalname),
    }),
    fileFilter: (req, file, cb) => {
      if (mimetypes.includes(file.mimetype)) cb(null, true);
      else cb(null, false);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  });
  
const uploadUserImages = generateUploadImageMulter(
  "./assets/images/user"
);
const uploadCommentImages = generateUploadImageMulter(
  "./assets/images/comment"
);

const uploadPostImages = generateUploadImageMulter(
  "./assets/images/post"
);

module.exports = { uploadPostImages, uploadUserImages, uploadCommentImages };
