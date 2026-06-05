type VercelRequest = { method?: string; body?: unknown };
type VercelResponse = { status: (code: number) => VercelResponse; json: (body: unknown) => void };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(200).json({ summary: 'AI endpoint is ready. Add GROQ_API_KEY in Vercel Environment Variables to enable live GreenOps summaries.' });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a concise GreenOps analyst. Return one executive-ready sentence with one action.' },
        { role: 'user', content: JSON.stringify(req.body) }
      ],
      temperature: 0.2,
      max_tokens: 120
    })
  });
  if (!response.ok) return res.status(200).json({ summary: 'AI provider did not return a summary. Check the GROQ_API_KEY and model access.' });
  const data = await response.json();
  return res.status(200).json({ summary: data.choices?.[0]?.message?.content ?? 'No insight returned.' });
}
