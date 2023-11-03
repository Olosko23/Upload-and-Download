import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/files");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const permanentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/file");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const permanentUpload = multer({ storage: permanentStorage });

app.use("/uploads", express.static("public/files"));
app.use("/images", express.static("public/image"));

app.get("/", (req, res) => {
  res.status(200).json("Up and Running");
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    permanentUpload.single("file")(req, res, (err) => {
      if (err) {
        res
          .status(500)
          .json({ message: "Failed to move file to permanent storage" });
      } else {
        res.status(200).json({
          message: "File uploaded and moved to permanent storage successfully",
          originalname: req.file.originalname,
        });
      }
    });
  } else {
    res.status(400).json({ message: "No file uploaded" });
  }
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "public/files", filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
