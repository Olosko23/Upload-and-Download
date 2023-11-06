import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const upload = multer({ dest: "temp" });

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

app.get("/", (req, res) => {
  res.status(200).json("Up and Running..");
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (req.file) {
    const fileContent = fs.readFileSync(req.file.path);

    const params = {
      Bucket: "trialassist",
      Key: req.file.originalname,
      Body: fileContent,
    };

    // Upload the file to S3
    s3.upload(params, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: "File upload failed" });
      } else {
        fs.unlinkSync(req.file.path);
        res.status(200).json({
          message: "File uploaded successfully",
          originalname: req.file.originalname,
          location: data.Location,
        });
      }
    });
  } else {
    res.status(400).json({ message: "No file uploaded" });
  }
});

app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;

  const params = {
    Bucket: "trialassist",
    Key: filename,
  };

  // Download the file from S3
  s3.getObject(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(404).json({ message: "File not found" });
    } else {
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Type", data.ContentType);
      res.send(data.Body);
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
