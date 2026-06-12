'use server';
/**
 * @fileOverview An AI assistant that generates frequently asked questions (FAQs) and their answers
 * based on an event description for event organizers.
 *
 * - generateFaqs - A function that handles the FAQ generation process.
 * - OrganizerFaqGeneratorInput - The input type for the generateFaqs function.
 * - OrganizerFaqGeneratorOutput - The return type for the generateFaqs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrganizerFaqGeneratorInputSchema = z.object({
  description: z
    .string()
    .describe('The detailed description of the event.'),
});
export type OrganizerFaqGeneratorInput = z.infer<
  typeof OrganizerFaqGeneratorInputSchema
>;

const FaqItemSchema = z.object({
  question: z
    .string()
    .describe('A relevant frequently asked question about the event.'),
  answer: z
    .string()
    .describe('A concise answer to the frequently asked question.'),
});

const OrganizerFaqGeneratorOutputSchema = z.array(FaqItemSchema).describe('An array of generated FAQs and their answers.');
export type OrganizerFaqGeneratorOutput = z.infer<
  typeof OrganizerFaqGeneratorOutputSchema
>;

const organizerFaqGeneratorPrompt = ai.definePrompt({
  name: 'organizerFaqGeneratorPrompt',
  input: {schema: OrganizerFaqGeneratorInputSchema},
  output: {schema: OrganizerFaqGeneratorOutputSchema},
  prompt: `You are an AI assistant specialized in generating frequently asked questions (FAQs) and their answers for event organizers.
Your goal is to help organizers provide comprehensive information to potential attendees based on the event description.

Generate a list of 5-10 relevant and common FAQs along with their concise answers based on the following event description.
Ensure the questions cover various aspects like event details, ticketing, venue, policies, etc., as appropriate for the event.

Event Description:
{{{description}}}

Respond with a JSON array of objects, where each object has a 'question' and an 'answer' field. For example:
[
  {
    "question": "What are the event dates and times?",
    "answer": "The event will take place on October 26-27, 2024, from 9:00 AM to 5:00 PM daily."
  },
  {
    "question": "Is there an age restriction for this event?",
    "answer": "This event is open to all ages, but attendees under 16 must be accompanied by an adult."
  }
]
`,
});

const organizerFaqGeneratorFlow = ai.defineFlow(
  {
    name: 'organizerFaqGeneratorFlow',
    inputSchema: OrganizerFaqGeneratorInputSchema,
    outputSchema: OrganizerFaqGeneratorOutputSchema,
  },
  async (input) => {
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        const {output} = await organizerFaqGeneratorPrompt(input);
        return output!;
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff: 3s, 6s, 12s, 24s...)
        const delay = Math.pow(2, attempts) * 1500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Failed to generate FAQs after multiple attempts.');
  },
);

export async function generateFaqs(
  input: OrganizerFaqGeneratorInput,
): Promise<OrganizerFaqGeneratorOutput> {
  return organizerFaqGeneratorFlow(input);
}
