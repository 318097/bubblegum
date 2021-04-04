const { fileUpload } = require("../util/file-upload");

exports.fileUploadHandler = async (req, res) => {
  const result = await fileUpload(req);
  res.send(result);
};
