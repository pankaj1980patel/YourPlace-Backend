const multer = require("multer");
const { v4: uuid } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  //   limits: { fileSize: 500000 }, // Adjust the file size limit as needed.
  // dest:"./uploads/",
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const err = new Error("something went wrong in destination");
      cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
      const err = new Error("something went wrong in filename");

      const ext = MIME_TYPE_MAP[file.mimetype] || "png"; // Default to 'png' if the mime type is not recognized.
      const stringName = uuid() + "." + ext;
      // console.log(stringName)
      cb(null, stringName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
