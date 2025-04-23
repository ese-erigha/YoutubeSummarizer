// OpenAI API interface
// Currently implemented in the backend to prevent exposing API keys on the frontend

/**
 * Interface for transcript summary response
 */
export interface SummaryResponse {
  summary: string;
  error?: string;
}

/**
 * Builds the prompt for the OpenAI API to summarize a transcript
 */
export function buildSummaryPrompt(transcript: string, title: string): string {
  return `
Summarize the following YouTube video transcript with title: "${title}". 
Keep the summary concise (100-200 words) and easy to understand.
Structure the response as:
1. A brief introduction paragraph (2-3 sentences)
2. 3-5 bullet points with the main topics/points from the video
3. A brief conclusion if appropriate (1 sentence)

TRANSCRIPT:
${transcript}
`;
}
