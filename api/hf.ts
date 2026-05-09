
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const model = url.searchParams.get('model');

  if (!model) {
    return new Response(JSON.stringify({ error: 'Missing model' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;

  if (!HF_TOKEN) {
    return new Response(JSON.stringify({ error: 'Hugging Face token not configured on server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const targetUrl = `https://api-inference.huggingface.co/models/${model}`;

  try {
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${HF_TOKEN}`);
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

    // Check if the response is an audio file or other binary
    const contentType = response.headers.get('Content-Type');

    if (contentType && (contentType.includes('audio') || contentType.includes('image'))) {
      const blob = await response.blob();
      return new Response(blob, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-store',
        },
      });
    }

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
