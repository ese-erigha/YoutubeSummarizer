// Simple Express server to build and serve our frontend
import express from 'express';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import { YoutubeTranscript } from 'youtube-transcript';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const distDir = join(rootDir, 'dist');

// Create our Express server 
const app = express();
const PORT = 5000;

// Add middleware
app.use(bodyParser.json());

console.log('Starting TubeSummarize app using Express to serve the frontend...');

// Build the app in production mode
function buildApp() {
  return new Promise((resolve, reject) => {
    console.log('Building the frontend application...');
    exec('npx vite build', { cwd: rootDir }, (error, stdout, stderr) => {
      if (error) {
        console.error('Build error:', error);
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
    
    console.log('Build complete, serving static files...');
    
    // Serve static assets from the dist directory
    app.use(express.static(join(distDir, 'public')));
    
    // API endpoint for checking the server status
    app.get('/api/status', (req, res) => {
      res.json({ status: 'ok', mode: 'production' });
    });
    
    // API endpoint for fetching YouTube transcripts
    app.post('/api/transcript', async (req, res) => {
      try {
        const { videoId } = req.body;
        
        if (!videoId) {
          return res.status(400).json({ error: 'Video ID is required' });
        }
        
        console.log(`Server fetching transcript for video: ${videoId}`);
        
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        
        if (!transcript || transcript.length === 0) {
          return res.status(404).json({ error: 'No transcript found for this video' });
        }
        
        // Convert to the expected format
        const formattedTranscript = transcript.map(item => ({
          text: item.text,
          timestamp: item.offset / 1000 // Convert from ms to seconds
        }));
        
        return res.json({ transcript: formattedTranscript });
      } catch (error) {
        console.error('Error fetching transcript:', error);
        return res.status(500).json({ 
          error: 'Failed to fetch transcript',
          details: error instanceof Error ? error.message : String(error)
        });
      }
    });
    
    // For all other routes, serve the index.html (SPA fallback)
    app.get('*', (req, res) => {
      res.sendFile(join(distDir, 'public', 'index.html'));
    });
    
    // Start listening
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();