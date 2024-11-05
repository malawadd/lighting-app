import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    const { userApiKey, messages, model, stream, max_tokens } = await request.json();

    if (!userApiKey) {
        return new Response(JSON.stringify({ error: "Missing API key" }), { status: 400 });
    }

    const sambanovaUrl = 'https://api.sambanova.ai/v1/chat/completions';
    const sambanovaRequest = new Request(sambanovaUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${userApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            stream,
            model,
            messages,
          
        }),
    });

    try {
        const response = await fetch(sambanovaRequest);
        console.log(response)
        if (!response.ok) {
            return new Response(JSON.stringify({ error: "Error from SambaNova API" }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Accumulate all chunks from the response body
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        while (reader) {
            const { done, value } = await reader.read();
            if (done) break;
            fullResponse += decoder.decode(value, { stream: true });
        }

        // Ensure the accumulated response is returned as a JSON object
        return new Response(JSON.stringify({ data: fullResponse }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error("Error with SambaNova API call:", error);
        return new Response(JSON.stringify({ error: "Failed to call SambaNova API" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
