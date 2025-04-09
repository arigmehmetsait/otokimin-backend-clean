// server.js
const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Firebase Admin SDK'yı başlat
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
app.get("/check-env", (req, res) => {
  try {
    const parsed = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
    res.status(200).json({ success: true, parsed });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "FIREBASE_ADMIN_SDK env parse edilemedi",
      error: err.message,
    });
  }
});
// Bildirim gönderme endpointi
app.post("/sendNotification", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "token, title ve body gerekli" });
  }

  const message = {
    token: token,
    notification: {
      title: title,
      body: body,
    },
    android: {
      notification: {
        sound: "default",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Bildirim gönderildi:", response);
    res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("Bildirim gönderilemedi:", error);
    res.status(500).json({ success: false, error });
  }
});

app.get("/", (req, res) => {
  res.send("Hoş geldiniz! Bildirim sunucusu çalışıyor.");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Bildirim sunucusu çalışıyor: http://localhost:${PORT}`);
});
