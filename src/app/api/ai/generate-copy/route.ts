import {NextResponse} from 'next/server';

export const runtime = 'nodejs';

interface CopyBody {
  eventName?: string;
  eventType?: string;
  eventSummary?: string;
  keyFeatures?: string[];
  eventDate?: string;
  eventVenue?: string;
}

const esc = (s: string) =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Deterministic fallback used when no GEMINI_API_KEY is configured or the AI
 * call fails. Produces a genuinely useful, well-structured HTML description and
 * a clear policies block so the "Generate with AI" button always works.
 */
function templateCopy(input: CopyBody): {eventDescription: string; eventPolicies: string} {
  const name = esc(input.eventName || 'this event');
  const category = esc(input.eventType || 'Event');
  const summary = esc(input.eventSummary || '');
  const venue = esc(input.eventVenue || '');
  const date = esc(input.eventDate || '');
  const features = (input.keyFeatures || []).map((f) => esc(f)).filter(Boolean);

  const featureList = features.length
    ? `<h2>What to expect</h2><ul>${features.map((f) => `<li>${f}</li>`).join('')}</ul>`
    : '';

  const where = venue
    ? `<p><strong>Venue:</strong> ${venue}</p>`
    : '';
  const when = date
    ? `<p><strong>Date &amp; time:</strong> ${date}</p>`
    : '';

  const eventDescription = `
<p>${summary || `Join us for ${name} — an unforgettable ${category.toLowerCase()} experience.`}</p>
${when}${where}${featureList}
<h2>Get your tickets</h2>
<p>Tickets are limited and going fast. Secure your spot now and get ready for a great time. Bring your ticket (printed or on your phone) to the gate for quick entry.</p>
<p>We can't wait to see you there!</p>
`.trim();

  const eventPolicies = `
<ul>
  <li><strong>Tickets are non-refundable</strong> unless the event is cancelled or rescheduled by the organizer.</li>
  <li>Please arrive on time — late entry is subject to venue capacity.</li>
  <li>Bring a valid ID that matches the name on your ticket.</li>
  <li>This ticket admits the holder once; screenshots are not valid at the gate.</li>
  <li>The organizer reserves the right to amend these policies when necessary.</li>
</ul>`.trim();

  return {eventDescription, eventPolicies};
}

/**
 * POST /api/ai/generate-copy — event description + policies.
 * Tries Gemini when GEMINI_API_KEY is set; otherwise (or on failure) returns a
 * deterministic, well-structured draft so the feature never breaks.
 */
export async function POST(req: Request) {
  let body: CopyBody = {};
  try {
    body = (await req.json()) as CopyBody;
  } catch {
    // fall through with empty body
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `You are an expert event copywriter for IsabiEvents, a Nigerian event marketplace. Write an engaging event description in clean HTML (only <p>, <h2>, <ul>, <li>, <strong>, <em>) and a concise policies list in HTML <ul><li>. Event: ${body.eventName}; Category: ${body.eventType}; Summary: ${body.eventSummary}; Highlights: ${(body.keyFeatures || []).join(', ')}; Date: ${body.eventDate}; Venue: ${body.eventVenue}. Return strict JSON with keys eventDescription and eventPolicies.`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{parts: [{text: prompt}]}],
            generationConfig: {responseMimeType: 'application/json', temperature: 0.8},
          }),
        }
      );
      clearTimeout(timer);
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = JSON.parse(text);
        if (parsed?.eventDescription) {
          return NextResponse.json({
            eventDescription: String(parsed.eventDescription),
            eventPolicies: String(parsed.eventPolicies || ''),
            source: 'ai',
          });
        }
      }
    } catch {
      // fall through to template
    }
  }

  return NextResponse.json({...templateCopy(body), source: 'template'});
}
