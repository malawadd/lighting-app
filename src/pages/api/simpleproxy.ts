import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    const { userApiKey } = await request.json();

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
            stream: true,
            model: "Meta-Llama-3.1-8B-Instruct",
            messages: [
                { role: "system", content: "You are a helpful assistant" },
                { role: "user", content: "Hello" }
            ],
        }),
    });

    try {
        const response = await fetch(sambanovaRequest);

        if (!response.ok) {
            return new Response(JSON.stringify({ error: "Error from SambaNova API" }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Read the entire response body as text
        const responseText = await response.text();
        
        // Log the response to check the content
        console.log("SambaNova Response:", responseText);

        return new Response(responseText, {
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
