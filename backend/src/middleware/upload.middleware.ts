import multer from "multer";
import fs from "fs";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("src/uploads/original")) {
      fs.mkdirSync("src/uploads/original", { recursive: true });
    }
    cb(null, "src/uploads/original");
  },
  filename: (req, file, cb) => {
    cb(null,
      "CM" + "-" + file.originalname
    );
  }
});

export const upload = multer({ storage });