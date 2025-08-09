module.exports = (req, res) => {
  const url = process.env.N8N_WEBHOOK_URL || "";
  res.status(200).json({
    N8N_WEBHOOK_URL: url.slice(0, 60) + (url.length > 60 ? "..." : "")
  });
};
