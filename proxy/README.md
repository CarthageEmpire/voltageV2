# Cloudflare Worker Proxy

Use this worker for public deployments so the Groq API key stays server-side.

## Deploy

1. Create a Cloudflare Worker from [`cloudflare-worker.js`](/c:/Users/Gigabite/Downloads/remix_-voltage/proxy/cloudflare-worker.js:1).
2. Add a Worker secret named `GROQ_API_KEY`.
3. Deploy the worker and copy its public URL.
4. Set `AI_PROXY_URL` in [`config.js`](/c:/Users/Gigabite/Downloads/remix_-voltage/config.js:1) to that URL.

## Local development

- Keep `AI_PROXY_URL` as `null`.
- Put your real Groq key in `config.local.js`.
- `config.local.js` is ignored by git and only used on your machine.
