import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "src/uploads/original";

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, {
        recursive: true
      });
    }

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      "CM-" + file.originalname
    );
  }
});

export const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(
        new Error("Seuls les fichiers PDF sont autorisés")
      );
    }

    cb(null, true);
  }
});