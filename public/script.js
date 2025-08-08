
// Add Subject (UI only for V1)
document.getElementById("addSubject").addEventListener("click", () => {
  alert("Coming soon: add multiple subjects.");
});

// Passion Scanner (placeholder)
document.getElementById("passionScanner").addEventListener("click", () => {
  alert("Launching Passion Scanner (10 quick questions)…");
});

// Important info
document.getElementById("importantInfo").addEventListener("click", (e) => {
  e.preventDefault();
  alert("We’ll collect only your selected topics and delivery method. Niche topics may not have daily updates; CrossFeed will fill gaps.");
});

// Subscribe → calls /api/subscribe (Vercel serverless function)
document.getElementById("subscribe").addEventListener("click", async () => {
  const payload = {
    frequency: document.getElementById("frequency").value,
    topic: document.getElementById("topic").value.trim(),
    channel: document.getElementById("channel").value,
    createdAt: new Date().toISOString(),
  };

  if (!payload.topic) {
    alert("Please enter a topic (e.g., Bitcoin, League of Legends, NBA).");
    return;
  }

  try {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      alert("Subscription saved! You’ll start receiving updates soon.");
    } else {
      alert("Something went wrong. Please try again.");
    }
  } catch (err) {
    console.error(err);
    alert("Network error. Please try again later.");
  }
});
