import OpenAI from 'openai';

// Initialize OpenAI client
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY
});

/**
 * Function to build the prompt for OpenAI API
 */
export function buildSummaryPrompt(transcript: string, title: string): string {
  return `Summarize the following YouTube video transcript with title: "${title}". 
Keep the summary concise (100-200 words) and easy to understand.
Structure the response as:
1. A brief introduction paragraph (2-3 sentences)
2. 3-5 bullet points with the main topics/points from the video
3. A brief conclusion if appropriate (1 sentence)

TRANSCRIPT:
${transcript}`;
}

/**
 * Function to generate a summary using OpenAI
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
            "You are an expert video summarizer. Create concise, easy-to-understand summaries of YouTube video transcripts. Follow the requested format exactly: a brief introduction, 3-5 bullet points with the main topics/points, and a short conclusion when appropriate. Keep the summary between 100-200 words total.",
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