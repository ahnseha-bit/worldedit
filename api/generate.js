export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'Missing API Key' });

    const { worldContext, eventInput } = req.body;
    if (!eventInput) return res.status(400).json({ error: 'Missing event input' });

    const prompt = `
        너는 소설 창작 보조 AI야. 아래의 [세계관 설정]을 철저히 준수해서, [발생 사건]에 대한 에피소드 초안을 작성해줘.
        
        === [세계관 설정] ===
        ${worldContext}
        
        === [발생 사건] ===
        ${eventInput}
        
        === [요청 사항] ===
        1. 등장인물의 성격과 배경 설정을 반영한 대사(Dialogue) 위주로 작성할 것.
        2. 세계관의 규칙(마법 등)이 사건 해결이나 갈등 심화에 어떻게 작용하는지 묘사할 것.
        3. 장면(Scene) 단위로 나누어 3~4개의 주요 장면을 서술해줘.
        4. 문체는 소설 본문처럼 몰입감 있게 작성해.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const generatedText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ text: generatedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
