// src/pages/api/nova.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const API_KEY = body.apiKey;
    
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'API key is required' }), {
        status: 400,
      });
    }

    // Remove apiKey from the payload before forwarding
    const { apiKey, ...restBody } = body;
    
    console.log('Sending request to SambaNova:', JSON.stringify(restBody, null, 2)); // Debug log
    
    const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stream: false,
        model: 'Llama-3.2-11B-Vision-Instruct',
        messages: restBody.messages,
      }),
    });

    const data = await response.json();
    console.log('SambaNova response:', data); // Debug log
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error); // Debug log
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to process request'
    }), {
      status: 500,
    });
  }
}