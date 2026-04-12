import multer from "multer";

const fileUpload = multer();

const fn = fileUpload.array("files");

export default fn;
