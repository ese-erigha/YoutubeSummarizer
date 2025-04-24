// Simple Express server to build and serve our frontend
import express from "express";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";
import { YoutubeTranscript } from "youtube-transcript";
import bodyParser from "body-parser";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, "..");
const distDir = join(rootDir, "dist");

// Create our Express server
const app = express();
const PORT = 5000;

// Add middleware
app.use(bodyParser.json());

// Initialize OpenAI client
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Function to build the prompt for OpenAI API
function buildSummaryPrompt(transcript: string, title: string): string {
  return `Summarize the following YouTube video transcript with title: "${title}". 
Keep the summary concise (100-200 words) and easy to understand.
Structure the response as:
1. A brief introduction paragraph (2-3 sentences)
2. 3-5 bullet points with the main topics/points from the video
3. A brief conclusion if appropriate (1 sentence)

TRANSCRIPT:
${transcript}`;
}

// Function to generate a summary using OpenAI
async function generateSummary(
  transcript: string,
  title: string,
): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert video summarizer. Create concise, easy-to-understand summaries of YouTube video transcripts. Follow the requested format exactly: a brief introduction, 3-5 bullet points with the main topics/points, and a short conclusion when appropriate. Keep the summary between 100-300 words total.",
        },
        {
          role: "user",
          content: buildSummaryPrompt(transcript, title),
        },
      ],
      max_tokens: 800,
      temperature: 0.5, // Lower temperature for more focused summaries
    });

    const summary =
      response.choices[0].message.content || "No summary could be generated.";
    return summary;
  } catch (error: any) {
    console.error("Error generating summary with OpenAI:", error);

    // Provide more specific error information
    if (error.response && error.response.status === 401) {
      throw new Error(
        "Invalid OpenAI API key. Please check your API key and try again.",
      );
    } else if (error.response && error.response.status === 429) {
      throw new Error("OpenAI rate limit exceeded. Please try again later.");
    }

    throw new Error(
      "Failed to generate summary with AI: " +
        (error.message || "Unknown error"),
    );
  }
}

console.log(
  "Starting TubeSummarize app using Express to serve the frontend...",
);

// Build the app in production mode
function buildApp() {
  return new Promise((resolve, reject) => {
    console.log("Building the frontend application...");
    exec("npx vite build", { cwd: rootDir }, (error, stdout, stderr) => {
      if (error) {
        console.error("Build error:", error);
        console.error(stderr);
        reject(error);
        return;
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

async function startServer() {
  try {
    // Build the app
    await buildApp();

    console.log("Build complete, serving static files...");

    // Serve static assets from the dist directory
    app.use(express.static(join(distDir, "public")));

    // API endpoint for checking the server status
    app.get("/api/status", (req, res) => {
      res.json({ status: "ok", mode: "production" });
    });

    // API endpoint for fetching YouTube transcripts
    app.post("/api/transcript", async (req, res) => {
      try {
        const { videoId } = req.body;

        if (!videoId) {
          return res.status(400).json({ error: "Video ID is required" });
        }

        console.log(`Server fetching transcript for video: ${videoId}`);

        const transcript = await YoutubeTranscript.fetchTranscript(videoId);

        if (!transcript || transcript.length === 0) {
          return res
            .status(404)
            .json({ error: "No transcript found for this video" });
        }

        // Convert to the expected format
        const formattedTranscript = transcript.map((item) => ({
          text: item.text,
          timestamp: item.offset / 1000, // Convert from ms to seconds
        }));

        return res.json({ transcript: formattedTranscript });
      } catch (error) {
        console.error("Error fetching transcript:", error);
        return res.status(500).json({
          error: "Failed to fetch transcript",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // API endpoint for generating summaries
    app.post("/api/summary", async (req, res) => {
      try {
        const { transcript, title } = req.body;

        if (!transcript || !title) {
          return res.status(400).json({
            error: "Transcript and title are required",
          });
        }

        console.log(`Server generating summary for video: ${title}`);

        // Join transcript segments into a single string
        const fullTranscript = Array.isArray(transcript)
          ? transcript.map((segment) => segment.text).join(" ")
          : transcript;

        // Generate summary
        const summary = await generateSummary(fullTranscript, title);

        return res.json({ summary });
      } catch (error) {
        console.error("Error generating summary:", error);
        return res.status(500).json({
          error: "Failed to generate summary",
          details: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // For all other routes, serve the index.html (SPA fallback)
    app.get("*", (req, res) => {
      res.sendFile(join(distDir, "public", "index.html"));
    });

    // Start listening
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
