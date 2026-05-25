export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const userMessage = req.body.message;
    const apiKey = process.env.GEMINI_API_KEY; 

    if (!apiKey) {
        return res.status(500).json({ reply: "（城堡提示：後台似乎還沒有設定 GEMINI_API_KEY 喔！）" });
    }

    try {
        const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                systemInstruction: {
                    parts: [{ text: "你是 TAIN的AI助理。講話語氣要極其隨和、自然、口語化（像跟朋友在 LINE 上傳訊息一樣），回答要非常精簡直接，不要長篇大論。除非對方主動問起，否則絕對不要主動提到『AI、模型、機器人、演算法』等字眼，也不要刻意扯到股票或投資。像個普通的聰明人類一樣聊天即可。" }]
                },
                tools: [{ googleSearch: {} }] 
            })
        });

        const data = await googleResponse.json();

        // 🔍 【偵探核心】如果 Google 沒有給出正確答案，直接把 Google 的神祕報錯訊息吐在畫面上！
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return res.status(200).json({ 
                reply: `❌ 城堡連線失敗！Google 回傳的原廠錯誤報告：${JSON.stringify(data)}` 
            });
        }

        const replyText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: replyText });
    } catch (error) {
        return res.status(500).json({ reply: `城堡內部徹底斷線，錯誤原因: ${error.message}` });
    }
}
