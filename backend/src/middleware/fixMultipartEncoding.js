export const fixMultipartEncoding = (req, res, next) => {
  if (req.files) {
    req.files.forEach((file) => {
      file.originalname = Buffer.from(file.originalname, "latin1").toString("utf8");
    });
  }

  next();
};