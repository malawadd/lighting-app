import type { APIRoute } from 'astro';

// Define the serverless function
export const post: APIRoute = async ({ request }) => {
    // Parse incoming request data
    const { userApiKey, ...otherData } = await request.json();

    // Check for the API key
    if (!userApiKey) {
        return new Response("Missing API key", { status: 400 });
    }

    // Construct the SambaNova API request
    const sambanovaUrl = 'https://api.sambanova.ai/v1/your-endpoint';
    const sambanovaRequest = new Request(sambanovaUrl, {
        method: 'POST', // Adjust method type as needed
        headers: {
            'Authorization': `Bearer ${userApiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(otherData),
    });

    // Fetch response from SambaNova API
    try {
        const response = await fetch(sambanovaRequest);
        const responseData = await response.json();

        return new Response(JSON.stringify(responseData), {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
            status: response.status,
        });
    } catch (error) {
        console.error("Error with SambaNova API call:", error);
        return new Response("Failed to call SambaNova API", { status: 500 });
    }
};
