'use server';
/**
 * @fileOverview This flow provides personalized event recommendations for an attendee.
 *
 * - attendeePersonalizedEventRecommendations - A function that generates event recommendations.
 * - AttendeePersonalizedEventRecommendationsInput - The input type for the recommendation function.
 * - AttendeePersonalizedEventRecommendationsOutput - The return type for the recommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendeePersonalizedEventRecommendationsInputSchema = z.object({
  pastPurchases: z
    .array(z.string())
    .describe('A list of event titles or IDs the user has purchased in the past.'),
  savedEvents: z
    .array(z.string())
    .describe('A list of event titles or IDs the user has saved.'),
  browsingHistory: z
    .array(z.string())
    .describe('A list of event titles or IDs the user has recently browsed.'),
  eventCategories: z.array(z.string()).describe('A list of available event categories.'),
  availableEvents: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        category: z.string(),
        description: z.string(),
      })
    )
    .describe('A list of all events currently available, with their ID, title, category, and description.'),
});
export type AttendeePersonalizedEventRecommendationsInput = z.infer<
  typeof AttendeePersonalizedEventRecommendationsInputSchema
>;

const AttendeePersonalizedEventRecommendationsOutputSchema = z.object({
  recommendedEventIds: z.array(z.string()).describe('A list of IDs of the recommended events.'),
});
export type AttendeePersonalizedEventRecommendationsOutput = z.infer<
  typeof AttendeePersonalizedEventRecommendationsOutputSchema
>;

export async function attendeePersonalizedEventRecommendations(
  input: AttendeePersonalizedEventRecommendationsInput
): Promise<AttendeePersonalizedEventRecommendationsOutput> {
  return attendeePersonalizedEventRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'attendeePersonalizedEventRecommendationsPrompt',
  input: {schema: AttendeePersonalizedEventRecommendationsInputSchema},
  output: {schema: AttendeePersonalizedEventRecommendationsOutputSchema},
  prompt: `You are an intelligent event recommendation engine for IsabiEvents, a Nigerian event marketplace.
Your goal is to provide personalized event recommendations to an attendee based on their past interactions.

Here is the attendee's past purchase history:
{{#if pastPurchases}} 
{{#each pastPurchases}} - {{{this}}}
{{/each}}
{{else}} No past purchases.
{{/if}}

Here are the events the attendee has saved:
{{#if savedEvents}}
{{#each savedEvents}} - {{{this}}}
{{/each}}
{{else}} No saved events.
{{/if}}

Here are the events the attendee has recently browsed:
{{#if browsingHistory}}
{{#each browsingHistory}} - {{{this}}}
{{/each}}
{{else}} No browsing history.
{{/if}}

Available event categories are: {{{eventCategories}}}.

Here is a list of all currently available events. Select between 3 and 5 relevant events from this list to recommend.
Prioritize events that align with the user's inferred interests from their past activities. Try to offer a diverse selection while staying relevant.

Available Events:
{{#each availableEvents}}ID: {{{id}}}, Title: {{{title}}}, Category: {{{category}}}, Description: {{{description}}}
{{/each}}

Provide your recommendations as a JSON array of event IDs only. For example: {"recommendedEventIds":["event-id-1", "event-id-2"]}`,
});

const attendeePersonalizedEventRecommendationsFlow = ai.defineFlow(
  {
    name: 'attendeePersonalizedEventRecommendationsFlow',
    inputSchema: AttendeePersonalizedEventRecommendationsInputSchema,
    outputSchema: AttendeePersonalizedEventRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
