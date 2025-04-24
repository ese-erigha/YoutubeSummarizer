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
  return `Create a detailed summary of the YouTube video transcript with title: "${title}". 
Please structure the summary as follows:
1. Main Topic/Theme
2. Key Points
3. Important Details
4. Conclusions/Takeaways

TRANSCRIPT:
${transcript}`;
}
