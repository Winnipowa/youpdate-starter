// api/subscribe.js
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    // Parse body safely
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body || "{}"); } catch { body = {}; }
    }
    body = body || {};
    const { topic, frequency, channel } = body;

    console.log("[subscribe] incoming payload:", { topic, frequency, channel });

    if (!topic || !frequency || !channel) {
      console.warn("[subscribe] missing fields");
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const webhook = process.env.N8N_WEBHOOK_URL;
    console.log("[subscribe] has N8N_WEBHOOK_URL?", Boolean(webhook));

    // If no webhook configured, just succeed
    if (!webhook) {
      return res.status(200).json({ success: true, forwarded: false });
    }

    // ---- IMPORTANT: forward BEFORE responding (with timeout) ----
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s safety timeout

    try {
      const forward = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const text = await forward.text();
      console.log("[subscribe] n8n status:", forward.status);
      console.log("[subscribe] n8n resp (first 200 chars):", text.slice(0, 200));
    } catch (err) {
      clearTimeout(timeout);
      console.error("[subscribe] error forwarding to webhook:", err?.name || err, err?.message || "");
      // We still return success to the client to avoid UX error popups
    }

    // Now respond to the client
    return res.status(200).json({ success: true, forwarded: true });
  } catch (e) {
    console.error("[subscribe] fatal:", e);
    return res.status(500).json({ success: false, error: "Internal error" });
  }
};
