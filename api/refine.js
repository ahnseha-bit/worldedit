export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'Missing API Key' });

    const { contextData } = req.body;

    const prompt = `
        You are a professional editor for a novel project.
        Based on the following RAW World Settings, generate a Polished Project Sheet.
        
        RAW DATA:
        ${contextData}

        Instructions:
        1. **Title**: Suggest a creative title if missing.
        2. **Genre**: Define genre/target.
        3. **Logline**: Write a compelling 1-sentence hook.
        4. **Keywords**: Extract 3-5 keywords.
        5. **Intention**: Write a planning intention (Why this story?).
        6. **Synopsis**: Combine background settings into a smooth narrative flow (Synopsis).
        7. **Characters**: Describe characters with depth (Personality, Goal, Conflict).
        8. **Etc**: Other rules or items.
        
        **CRITICAL INSTRUCTION:** Do NOT use markdown syntax (like **, ##, -). Output ONLY Plain Text.
        
        Output JSON format:
        {
            "title": "...",
            "genre": "...",
            "logline": "...",
            "keywords": "...",
            "intention": "...",
            "elements": "...",
            "synopsis": "...",
            "characters": "...",
            "items": "..."
        }
        Language: Korean.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const text = data.candidates[0].content.parts[0].text;
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        res.status(200).json(JSON.parse(cleanText));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
