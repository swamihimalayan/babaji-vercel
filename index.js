const express = require("express");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const app = express();
app.use(express.json());

// 🔹 Initialize Firebase Admin with service key
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 🔹 Gmail transporter setup (App Password required)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "YOUR_GMAIL_ADDRESS@gmail.com", // <-- yahan apna Gmail likho
    pass: "soxr cnzn uklo ikdy", // <-- yahan app password paste karo (spaces same rakhna)
  },
});

// 🔹 Test route
app.get("/", (req, res) => {
  res.send("✅ English Babaji Mail Server Running on Vercel!");
});

// 🔹 Email send route
app.post("/send-mail", async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    const mailOptions = {
      from: "YOUR_GMAIL_ADDRESS@gmail.com",
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: "📩 Mail Sent Successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// 🔹 For Vercel serverless
module.exports = app;
