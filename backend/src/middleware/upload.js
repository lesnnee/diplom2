import multer from "multer";
import path from "path";


const uploadPath = path.resolve("src/uploads");


// куда сохранять
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// фильтр (опционально)
const fileFilter = (req, file, cb) => {
  cb(null, true); // можно ограничить типы позже
};

const upload = multer({ storage, fileFilter });

export default upload;