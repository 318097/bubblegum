const path = require("path");
const cloudinary = require("cloudinary").v2;
const _ = require("lodash");
const streamifier = require("streamifier");
const config = require("../../config");

exports.fileUpload = async (req, { exactFileName = true, folder } = {}) => {
  if (!req.files) return null;

  cloudinary.config({
    cloud_name: "codedropstech",
    api_key: "577418165644118",
    api_secret: config.CLOUDINARY_API_SECRET,
  });

  const source = req.source ? req.source.toLowerCase() : "uncategorized";
  let folderPath = `${config.NODE_ENV}/${source}/${_.get(req, "user._id")}`;

  if (folder) folderPath += `/${folder}`;

  const responses = req.files.map(
    (file) =>
      new Promise((resolve, reject) => {
        let extra = {};

        if (exactFileName)
          extra = {
            use_filename: true,
            unique_filename: false,
          };

        const options = {
          folder: folderPath,
          filename: path.basename(path.resolve(file.originalname)),
          ...extra,
        };

        let stream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => (result ? resolve(result) : reject(error))
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      })
  );

  return Promise.all(responses);
};