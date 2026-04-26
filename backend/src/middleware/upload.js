import multer from "multer";
import path from "path";

const uploadPath = path.resolve("src/uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

filename: (req, file, cb) => {
  const ext = path.extname(file.originalname);

  const safeName =
    Date.now() + "-" + Math.random().toString(36).slice(2, 10) + ext;

  cb(null, safeName);
  },
});

export default multer({ storage });