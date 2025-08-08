// api/subscribe.js
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  try {
    let body = req.body;
    if (typeof body === "string") { 
      try { body = JSON.parse(body || "{}"); } catch { body = {}; } 
    }
    const { topic, frequency, channel } = body || {};
    if (!topic || !frequency || !channel) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Réponse immédiate au client pour éviter "Network error"
    res.status(200).json({ success: true });

    const webhook = process.env.N8N_WEBHOOK_URL;
    if (!webhook) {
      return console.log("[subscribe] No N8N_WEBHOOK_URL, payload:", body);
    }

    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      console.error("[subscribe] n8n replied", r.status, await r.text());
    }
  } catch (e) {
    console.error("[subscribe] fatal:", e);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: "Internal error" });
    }
  }
};
