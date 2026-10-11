import {NextResponse} from 'next/server';

export const runtime = 'nodejs';

/** Strip tags/markdown down to plain sentences for FAQ extraction. */
function plainText(html: string): string {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*#>`_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 220);
}

/**
 * POST /api/ai/faqs — derive FAQs from an event description.
 * Uses Gemini when GEMINI_API_KEY is set; otherwise extracts likely Q&A pairs
 * from the description so the FAQ tab always has content.
 */
export async function POST(req: Request) {
  let description = '';
  try {
    const body = (await req.json()) as {description?: string};
    description = body.description || '';
  } catch {
    // ignore
  }
  if (!description.trim()) return NextResponse.json([]);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{parts: [{text: `Generate 4-5 event FAQs (question + answer) from this description. Return strict JSON array of {question, answer}. Description: ${plainText(description).slice(0, 3000)}`}]}],
            generationConfig: {responseMimeType: 'application/json', temperature: 0.6},
          }),
        }
      );
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length) return NextResponse.json(parsed);
      }
    } catch {
      // fall through
    }
  }

  // Deterministic fallback: turn descriptive sentences into Q&A.
  const generic = [
    {question: 'Do I need a ticket to attend?', answer: 'Yes — a valid ticket is required for entry. Purchase yours here on IsabiEvents and bring it (printed or on your phone) to the gate.'},
    {question: 'Is my ticket refundable?', answer: 'Tickets are non-refundable unless the event is cancelled or rescheduled by the organizer.'},
  ];
  const derived = sentences(plainText(description))
    .slice(0, 3)
    .map((s) => ({question: `What should I know about this event?`, answer: s}));
  return NextResponse.json([...derived, ...generic]);
}
