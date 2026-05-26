export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userMessage = req.body.message;
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ reply: "後台尚未設定 API Key！" });
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                system: "你是 TAIN 的 AI 助理。講話語氣要極其隨和、自然、口語化（像跟朋友在 LINE 上傳訊息一樣），回答要非常精簡直接，不要長篇大論。除非對方主動問起，否則絕對不要主動提到『AI、模型、機器人、演算法』等字眼。像個普通的聰明人類一樣聊天即可。",
                messages: [
                    { role: 'user', content: userMessage }
                ]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API error:', data);
            return res.status(200).json({ reply: "我剛剛腦袋打結了，待會再問我～" });
        }

        const replyText = data.content?.[0]?.text || "我晃神了一下，你剛剛說什麼？";
        return res.status(200).json({ reply: replyText });

    } catch (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({ reply: "城堡內部通訊稍微卡住了，請再試一次！" });
    }
}
