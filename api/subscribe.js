// Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    // Basic validation
    if (!body.topic || !body.frequency || !body.channel) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    // Option A: Forward to your n8n webhook (recommended for Vercel)
    const webhook = process.env.N8N_WEBHOOK_URL;
    if (!webhook) {
      console.log("N8N_WEBHOOK_URL not set. Received payload:", body);
    } else {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    // Optionally: you could send a Telegram confirmation here if you store a chat_id later.

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: "Internal error" });
  }
}
