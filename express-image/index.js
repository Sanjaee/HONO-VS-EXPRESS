const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const cloudinary = require("cloudinary").v2;
const path = require("path");
require("dotenv").config();

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
    return cb(new Error("Only images are allowed"), false);
  }
  cb(null, true);
};
const upload = multer({ storage, fileFilter });

const app = express();
app.use(express.json());
app.use(cors());

// Route untuk upload file gambar ke Cloudinary
app.post("/upload", upload.single("image"), async (req, res) => {
  const { name } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Gambar tidak ditemukan" });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "hono_vs_express",
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        )
        .end(file.buffer);
    });

    const image = await prisma.image.create({
      data: {
        name: name,
        imageUrl: result.secure_url,
        createdAt: new Date(),
      },
    });

    res.status(201).json({ message: "Gambar berhasil diupload", image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menyimpan gambar" });
  }
});


app.post("/manual-upload", async (req, res) => {
  const { name, imageUrl } = req.body;

  if (!name || !imageUrl) {
    return res.status(400).json({ error: "Nama atau URL gambar tidak boleh kosong" });
  }

  try {
    const image = await prisma.image.create({
      data: {
        name: name,
        imageUrl: imageUrl,
        createdAt: new Date(),
      },
    });

    res.status(201).json({ message: "Gambar berhasil disimpan secara manual", image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal menyimpan gambar secara manual" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port http://localhost:${PORT}`);
});
