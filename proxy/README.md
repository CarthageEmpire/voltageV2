# Cloudflare Worker Proxy

Use this worker for public deployments so the Groq API key stays server-side.

## Deploy

1. Install Wrangler: `npm install -g wrangler`
2. Log in to Cloudflare: `wrangler login`
3. From the [`proxy`](/c:/Users/Gigabite/Downloads/remix_-voltage/proxy) folder, create the secret: `wrangler secret put GROQ_API_KEY`
4. Deploy the worker: `wrangler deploy`
5. Copy the deployed worker URL.
6. Set `AI_PROXY_URL` in [`config.js`](/c:/Users/Gigabite/Downloads/remix_-voltage/config.js:1) to that URL.

The included [`wrangler.toml`](/c:/Users/Gigabite/Downloads/remix_-voltage/proxy/wrangler.toml:1) is ready for this worker.

## Local development

- Keep `AI_PROXY_URL` as `null`.
- Put your real Groq key in `config.local.js`.
- `config.local.js` is ignored by git and only used on your machine.
