require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");
const { Resend } = require("resend");
const { v4: uuidv4 } = require("uuid");
const cron = require("node-cron");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

const upload = multer({
  dest: "C:/tmp/evarphoto/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function(req, file, cb) {
    const allowed = ["image/jpeg", "image/png", "image/heic", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const jobs = {};

async function uploadToCloudinary(filePath, publicId) {
  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    folder: "evarphoto",
    resource_type: "image",
  });
  return result.secure_url;
}

async function uploadBufferToCloudinary(buffer, publicId) {
  return new Promise(function(resolve, reject) {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: "evarphoto", resource_type: "image" },
      function(error, result) {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function deleteFromCloudinary(publicId) {
  try {
    await cloudinary.uploader.destroy("evarphoto/" + publicId);
  } catch (e) {
    console.error("Cloudinary delete error:", e.message);
  }
}

app.get("/health", function(req, res) {
  res.json({ status: "ok", service: "evarphoto-api" });
});

app.post("/api/upload", upload.single("photo"), async function(req, res) {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  const jobId = uuidv4();

  try {
    const originalUrl = await uploadToCloudinary(req.file.path, jobId + "_original");

    const fileBuffer = fs.readFileSync(req.file.path);
    const form = new FormData();
    form.append("image_file", fileBuffer, { filename: "photo.jpg", contentType: req.file.mimetype });
    form.append("size", "auto");
    form.append("format", "jpg");
    form.append("bg_color", (req.body.bgColor || "ffffff").replace("#", ""));

    const bgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: Object.assign({ "X-Api-Key": process.env.REMOVEBG_API_KEY }, form.getHeaders()),
      body: form,
    });

    let processedUrl;
    if (!bgResponse.ok) {
      processedUrl = originalUrl;
    } else {
      const processedBuffer = await bgResponse.buffer();
      processedUrl = await uploadBufferToCloudinary(processedBuffer, jobId + "_processed");
    }

    jobs[jobId] = {
      status: "processed",
      originalPublicId: jobId + "_original",
      processedPublicId: jobId + "_processed",
      processedUrl: processedUrl,
      bgColor: req.body.bgColor || "#ffffff",
      country: req.body.country || "US",
      docType: req.body.docType || "passport",
      createdAt: Date.now(),
      paid: false,
      email: null,
    };

    fs.unlinkSync(req.file.path);

    res.json({ jobId: jobId, previewUrl: processedUrl, status: "processed" });

  } catch (err) {
    console.error("Upload error:", err);
    try { fs.unlinkSync(req.file.path); } catch(e) {}
    res.status(500).json({ error: "Processing failed. Please try again." });
  }
});

app.post("/api/create-checkout", async function(req, res) {
  const jobId = req.body.jobId;
  const plan = req.body.plan;
  const email = req.body.email;
  if (!jobs[jobId]) return res.status(404).json({ error: "Job not found" });

  jobs[jobId].email = email;
  jobs[jobId].paid = true;

  try {
    if (email) {
      const downloadUrl = jobs[jobId].processedUrl;
      await sendDeliveryEmail(email, downloadUrl, jobs[jobId]);
    }
    res.json({ success: true, downloadUrl: jobs[jobId].processedUrl });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to process order" });
  }
});

app.get("/api/download/:jobId", async function(req, res) {
  const job = jobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: "Job not found or expired" });

  res.json({ downloadUrl: job.processedUrl, status: "ready" });
});

async function sendDeliveryEmail(email, downloadUrl, job) {
  await resend.emails.send({
    from: "EvarPhoto <onboarding@resend.dev>",
    to: email,
    subject: "Your passport photo is ready!",
    html: "<div style='font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;'><h1 style='font-size:22px;font-weight:700;color:#1e1b4b;'>Your photo is ready!</h1><p style='color:#6b7280;'>Your " + job.country + " " + job.docType + " passport photo is processed and ready.</p><a href='" + downloadUrl + "' style='display:block;text-align:center;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:16px;padding:14px 28px;border-radius:10px;text-decoration:none;margin:24px 0;'>Download Your Photo</a><p style='font-size:12px;color:#9ca3af;'>Link expires in 1 hour.</p></div>",
  });
}

cron.schedule("*/30 * * * *", async function() {
  const oneHour = 60 * 60 * 1000;
  const now = Date.now();
  for (const jobId in jobs) {
    const job = jobs[jobId];
    if (now - job.createdAt > oneHour) {
      await deleteFromCloudinary(job.originalPublicId);
      await deleteFromCloudinary(job.processedPublicId);
      delete jobs[jobId];
    }
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, function() {
  console.log("EvarPhoto API running on port " + PORT);
});