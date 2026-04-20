export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
      const apiKey = env?.GROQ_API_KEY;
      if (!apiKey) {
        return jsonResponse({ error: 'Server misconfigured: missing GROQ_API_KEY' }, 500);
      }

      const body = await request.json();
      const model = String(body?.model || 'llama-3.3-70b-versatile');
      const messages = Array.isArray(body?.messages)
        ? body.messages
        : [{ role: 'user', content: String(body?.prompt || '') }];

      const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.8,
          max_tokens: 1024
        })
      });

      const data = await upstream.json();
      if (!upstream.ok) {
        const msg = data?.error?.message || `Groq HTTP ${upstream.status}`;
        return jsonResponse({ error: msg }, upstream.status);
      }

      const reply = data?.choices?.[0]?.message?.content?.trim() || '';
      return jsonResponse({ reply }, 200);
    } catch (err) {
      return jsonResponse({ error: err?.message || 'Unexpected proxy error' }, 500);
    }
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}
