
'use server';
/**
 * @fileOverview An AI content assistant for event organizers to generate engaging event descriptions and clear event policies.
 *
 * - generateEventCopy - A function that handles the generation of event description and policies.
 * - OrganizerAICopyGeneratorInput - The input type for the generateEventCopy function.
 * - OrganizerAICopyGeneratorOutput - The return type for the generateEventCopy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrganizerAICopyGeneratorInputSchema = z.object({
  eventName: z.string().describe('The name of the event.'),
  eventType: z
    .enum([
      'Concerts',
      'Festivals',
      'Conferences',
      'Nightlife',
      'Sports',
      'Religious Events',
      'Cultural Events',
      'Exhibitions',
      'Workshops',
      'Community Events',
    ])
    .describe('The category or type of the event.'),
  eventSummary: z.string().describe('A brief summary or elevator pitch for the event.'),
  keyFeatures: z.array(z.string()).describe('A list of key features or highlights of the event.'),
  targetAudience: z.string().optional().describe('The primary target audience for the event.'),
  eventDate: z
    .string()
    .describe('The date and time of the event (e.g., "YYYY-MM-DD HH:MM").'),
  eventDateDetails: z.string().optional(),
  eventVenue: z.string().describe('The venue where the event will take place.'),
  eventPoliciesInstructions: z
    .string()
    .optional()
    .describe('Optional specific instructions or points to include in the event policies.'),
});
export type OrganizerAICopyGeneratorInput = z.infer<typeof OrganizerAICopyGeneratorInputSchema>;

const OrganizerAICopyGeneratorOutputSchema = z.object({
  eventDescription: z.string().describe('An engaging and detailed event description.'),
  eventPolicies: z.string().describe('Clear and concise event policies.'),
});
export type OrganizerAICopyGeneratorOutput = z.infer<typeof OrganizerAICopyGeneratorOutputSchema>;

export async function generateEventCopy(
  input: OrganizerAICopyGeneratorInput
): Promise<OrganizerAICopyGeneratorOutput> {
  return organizerAICopyGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'organizerAICopyGeneratorPrompt',
  input: {schema: OrganizerAICopyGeneratorInputSchema},
  output: {schema: OrganizerAICopyGeneratorOutputSchema},
  prompt: `You are an expert event copywriter and policy generator for IsabiEvents, a leading Nigerian event marketplace. Your task is to create an engaging event description and clear, concise event policies based on the provided event details.

---START EVENT DETAILS---
Event Name: {{{eventName}}}
Event Type: {{{eventType}}}
Event Summary: {{{eventSummary}}}
Key Features:
{{#each keyFeatures}}- {{{this}}}
{{/each}}
Target Audience: {{{targetAudience}}}
Date & Time: {{{eventDate}}}
Venue: {{{eventVenue}}}
{{#if eventPoliciesInstructions}}
Specific Policy Instructions: {{{eventPoliciesInstructions}}}
{{/if}}
---END EVENT DETAILS---

First, generate an engaging event description, suitable for a marketplace listing. It should be compelling, highlight the key features, and appeal to the target audience. Write it in a vibrant and professional tone with a touch of the Naija spirit where appropriate.

Second, generate clear, concise, and comprehensive event policies. These policies should cover general event rules, refund/cancellation guidelines (mentioning IsabiEvents 48-hour post-event settlement protection), age restrictions (if applicable), and any other relevant guidelines. If specific policy instructions were provided, incorporate them appropriately. Keep the language direct and easy to understand.

Ensure your entire output is in JSON format, strictly adhering to the provided schema.`,
});

const organizerAICopyGeneratorFlow = ai.defineFlow(
  {
    name: 'organizerAICopyGeneratorFlow',
    inputSchema: OrganizerAICopyGeneratorInputSchema,
    outputSchema: OrganizerAICopyGeneratorOutputSchema,
  },
  async input => {
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const {output} = await prompt(input);
        return output!;
      } catch (error: any) {
        attempts++;
        
        const isQuotaError = 
          error.message?.includes('429') || 
          error.message?.includes('RESOURCE_EXHAUSTED') ||
          error.message?.includes('Quota exceeded');

        if (attempts >= maxAttempts) {
          if (isQuotaError) {
            return {
              eventDescription: "AI generation is temporarily busy due to high demand. Please try again in a few minutes or write your description manually.",
              eventPolicies: "Standard IsabiEvents event policies apply."
            };
          }
          throw error;
        }
        
        const delay = Math.pow(2, attempts) * (isQuotaError ? 3000 : 1500);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Failed to generate event copy after multiple attempts.');
  }
);
