import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

let serviceAccount;

try {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK);
} catch (err) {
  console.error("FIREBASE_ADMIN_SDK parse hatası:", err.message);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ error: "Sadece POST istekleri desteklenir." });
  }

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
    const response = await getMessaging().send(message);
    console.log("✅ Bildirim gönderildi:", response);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error("❌ Bildirim gönderilemedi:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
