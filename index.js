const express = require("express");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const app = express();

// Firebase Admin setup
const serviceAccount = require("./serviceAccountKey.json"); // add later
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Gmail credentials
const ADMIN_EMAIL = "sd2353241@gmail.com";
const APP_PASSWORD = "YAHAN_APNA_16_DIGIT_APP_PASSWORD_DAALO"; // Gmail App Password daalna yahan

// Gmail transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: ADMIN_EMAIL, pass: APP_PASSWORD },
});

// API route
app.get("/api/generatePin", async (req, res) => {
  try {
    const { phone, type } = req.query;
    if (!phone || !type) return res.status(400).send("phone & type required");

    const plans = {
      classes: { days: 365, price: 99 },
      live: { days: 7, price: 20 },
      practice: { days: 5, price: 20 },
    };

    const plan = plans[type.toLowerCase()];
    if (!plan) return res.status(400).send("invalid type");

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const now = Date.now();
    const expiresAt = now + plan.days * 24 * 60 * 60 * 1000;

    await db.collection("pins").add({
      phone,
      type,
      pin,
      price: plan.price,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt,
      used: false,
    });

    // Email notification
    await transporter.sendMail({
      from: ADMIN_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New ${type} PIN generated`,
      text: `${phone} ka ${type} PIN ${pin} (₹${plan.price}) valid till ${new Date(
        expiresAt
      ).toLocaleDateString("en-IN")}`,
    });

    res.send({
      ok: true,
      pin,
      type,
      price: plan.price,
      validTill: new Date(expiresAt).toLocaleDateString("en-IN"),
      message: "Mail sent to admin",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// Run local server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
