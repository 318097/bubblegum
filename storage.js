const multer = require("multer");

const fileUpload = multer();

const fn = fileUpload.single("files");

module.exports = fn;
