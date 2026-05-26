export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userMessage = req.body.message;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ reply: "後台尚未設定 GEMINI_API_KEY！" });
    }

    try {
        const googleResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                    systemInstruction: {
                        parts: [{ text: "你是 TAIN的AI助理。講話語氣要極其隨和、自然、口語化（像跟朋友在 LINE 上傳訊息一樣），回答要非常精簡直接，不要長篇大論。除非對方主動問起，否則絕對不要主動提到『AI、模型、機器人、演算法』等字眼，也不要刻意扯到股票或投資。像個普通的聰明人類一樣聊天即可。" }]
                    }
                })
            }
        );

        const data = await googleResponse.json();

        // 錯誤處理：配額超限
        if (data?.error?.code === 429) {
            return res.status(200).json({ reply: "我剛剛腦袋打結了一下，30 秒後再問我看看～" });
        }

        // 其他 API 錯誤
        if (data?.error) {
            console.error('Gemini API error:', data.error);
            return res.status(200).json({ reply: "城堡內部有點小狀況，待會再試試？" });
        }

        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "我晃神了一下，你剛剛說什麼？";
        return res.status(200).json({ reply: replyText });

    } catch (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({ reply: "城堡內部通訊稍微卡住了，請再試一次！" });
    }
}
