# Youpdate – Starter (Static + Vercel Functions)

This is a minimal starter for Youpdate V1.

- Static **landing** served from `/public`
- Serverless endpoint **POST /api/subscribe** that forwards the payload to your **n8n webhook**
- **No DB required** for the MVP (n8n handles storage + automation)

## Quickstart

1) **Clone or download** this repo.
2) Put your n8n webhook URL into an environment variable on Vercel:

```
N8N_WEBHOOK_URL=https://YOUR-N8N-INSTANCE/webhook/xxxx
```

3) **Deploy to Vercel**:
- Create a new project on https://vercel.com and import this folder
- Add the environment variable above in Project → Settings → Environment Variables
- Deploy

4) Open your deployed URL and submit a topic. The serverless function will forward the payload to your n8n webhook.

## Local Dev

You can use the Vercel CLI for local dev:

```bash
npm i -g vercel
vercel dev
```

Or serve the `/public` folder with any static server. The function under `/api/subscribe.js` requires the Vercel dev runtime to run locally.

## Files

- `public/index.html` – the main page with the sentence: “I want news every [Daily] on [Bitcoin] via [Telegram]”
- `public/style.css` – dark UI styling
- `public/script.js` – sends POST to `/api/subscribe`
- `api/subscribe.js` – serverless function that forwards data to `N8N_WEBHOOK_URL`
- `vercel.json` – config to serve static + functions

## Next Steps

- Add Stripe Checkout on the client and a `/api/stripe-webhook` function
- n8n: store users, deduplicate topics, schedule daily sends
- Add Telegram connect flow to capture chat_id (e.g., user sends /start to your bot)
