import OpenAI from "openai";

// Make sure the API key is accessible for the frontend-only app
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Allow browser usage - needed for client-side
});

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

/**
 * Generates a summary using OpenAI
 */
export async function generateSummary(transcript: string, title: string): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert video summarizer. Analyze the transcript of a YouTube video and provide a detailed summary following the requested structure. Be specific and extract the most important information, organizing it into the Main Topic/Theme, Key Points, Important Details, and Conclusions/Takeaways sections.",
        },
        {
          role: "user",
          content: buildSummaryPrompt(transcript, title),
        },
      ],
      max_tokens: 800,
      temperature: 0.5, // Lower temperature for more focused summaries
    });

    const summary = response.choices[0].message.content || "No summary could be generated.";
    return summary;
  } catch (error: any) {
    console.error('Error generating summary with OpenAI:', error);
    
    // Provide more specific error information
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
    } else if (error.response && error.response.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    }
    
    throw new Error('Failed to generate summary with AI: ' + (error.message || 'Unknown error'));
  }
}