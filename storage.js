const multer = require("multer");

const fileUpload = multer();

const fn = fileUpload.array("files");

module.exports = fn;
