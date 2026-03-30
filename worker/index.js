export default {
  async fetch(request, env) {
    const allowedOrigins = [
  'https://ag2027.github.io',
  'https://ag2027.github.io/SAFEY_1',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://[::1]:8000'
];

    const origin = request.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };
    if (allowedOrigins.includes(origin)) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    try {
      if (!env.CEREBRAS_API_KEY) {
        return new Response(JSON.stringify({ error: 'Server misconfigured: missing CEREBRAS_API_KEY secret' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const body = await request.json();
      const messages = body?.messages;
      const options = body?.options || {};

      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'Missing messages' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const upstream = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: options.model || 'llama-3.3-70b',
          messages,
          max_completion_tokens: options.max_completion_tokens ?? 2048,
          temperature: options.temperature ?? 0.2,
          top_p: options.top_p ?? 1
        })
      });

      const responseText = await upstream.text();
      let data = null;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        data = null;
      }

      if (!upstream.ok) {
        const upstreamMessage =
          data?.error?.message ||
          data?.message ||
          responseText ||
          `Upstream error (${upstream.status})`;

        return new Response(JSON.stringify({ error: upstreamMessage }), {
          status: upstream.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const reply = data?.choices?.[0]?.message?.content || '';
      return new Response(JSON.stringify({ reply }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};