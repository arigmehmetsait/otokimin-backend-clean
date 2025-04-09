const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// Firebase Admin SDK başlatma
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
  if (!admin.apps.length) {
    // Zaten başlatılmışsa tekrar başlatma
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  console.log("✅ Firebase Admin SDK başarıyla başlatıldı");
} catch (err) {
  console.error("❌ Firebase Admin SDK başlatılamadı:", err.message);
  throw new Error("Firebase Admin SDK başlatılamadı");
}

// Bildirim gönderme endpointi
app.post("/sendNotification", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "token, title ve body gerekli" });
  }

  const message = {
    token,
    notification: { title, body },
    android: { notification: { sound: "default" } },
    apns: { payload: { aps: { sound: "default" } } },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Bildirim gönderildi:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Bildirim gönderilemedi:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hoş geldiniz! Bildirim sunucusu çalışıyor.");
});

// Vercel için export
module.exports = app;
