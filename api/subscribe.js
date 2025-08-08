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
    body = body || {};
    const { topic, frequency, channel } = body;

    // Log minimal (pas de secrets)
    console.log("[subscribe] incoming payload:", { topic, frequency, channel });

    if (!topic || !frequency || !channel) {
      console.warn("[subscribe] missing fields");
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Répondre au client d'abord (évite 'Network error')
    res.status(200).json({ success: true });

    const webhook = process.env.N8N_WEBHOOK_URL;
    console.log("[subscribe] has N8N_WEBHOOK_URL?", Boolean(webhook));

    if (!webhook) {
      console.warn("[subscribe] N8N_WEBHOOK_URL not set. Skipping forward.");
      return;
    }

    try {
      const forward = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await forward.text();
      console.log("[subscribe] n8n status:", forward.status);
      console.log("[subscribe] n8n resp (first 200 chars):", text.slice(0, 200));
    } catch (err) {
      console.error("[subscribe] error forwarding to n8n:", err);
    }
  } catch (e) {
    console.error("[subscribe] fatal:", e);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, error: "Internal error" });
    }
  }
};
