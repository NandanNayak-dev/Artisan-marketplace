const multer = require("multer");

const storage = multer.diskStorage({});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = upload;
