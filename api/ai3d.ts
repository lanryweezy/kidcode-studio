
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get('provider');
  const path = url.searchParams.get('path');

  if (!provider) {
    return new Response(JSON.stringify({ error: 'Missing provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const PROVIDER_CONFIGS: Record<string, { base: string, key?: string }> = {
    tripo: {
      base: 'https://api.tripo3d.ai/v2/openapi',
      key: process.env.TRIPO_API_KEY
    },
    meshy: {
      base: 'https://api.meshy.ai/v2',
      key: process.env.MESHY_API_KEY
    },
    luma: {
      base: 'https://api.lumalabs.ai/v1',
      key: process.env.LUMA_API_KEY
    }
  };

  const providerConfig = PROVIDER_CONFIGS[provider];
  if (!providerConfig) {
    return new Response(JSON.stringify({ error: 'Invalid provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!providerConfig.key) {
    return new Response(JSON.stringify({ error: `${provider} API key not configured on server` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const targetUrl = `${providerConfig.base}/${path || ''}`;

  try {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${config.key}`);
    headers.set('Content-Type', 'application/json');

    const options: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await req.text();
      if (body) {
        options.body = body;
      }
    }

    const response = await fetch(targetUrl, options);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Failed to proxy request', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
