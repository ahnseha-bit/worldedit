export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'Missing API Key' });

    const { fileContent } = req.body;

    const prompt = `
        Analyze the provided text and extract story settings.
        Language: Korean.
        
        Text: """${fileContent}"""
    `;

    const generationConfig = {
        response_mime_type: "application/json",
        response_schema: {
            type: "OBJECT",
            properties: {
                settings: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            title: { type: "STRING" },
                            desc: { type: "STRING" },
                            tag: { type: "STRING" },
                            icon: { type: "STRING" }
                        },
                        required: ["title", "desc", "tag", "icon"]
                    }
                }
            }
        }
    };

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const text = data.candidates[0].content.parts[0].text;
        res.status(200).json(JSON.parse(text));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
