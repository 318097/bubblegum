const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const config = require("../../config");

exports.fileUpload = async (req, { file, filename, folder } = {}) => {
  if (!req.file) return null;

  cloudinary.config({
    cloud_name: "codedropstech",
    api_key: "577418165644118",
    api_secret: config.CLOUDINARY_API_SECRET,
  });

  const baseName = req.source ? req.source.toLowerCase() : "uncategorized";
  let path = baseName;

  if (!config.IS_PROD) path = `${config.NODE_ENV}/${baseName}`;
  if (folder) path += `/${folder}`;

  const options = { folder: path };

  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};
