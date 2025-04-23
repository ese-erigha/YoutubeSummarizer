import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidYoutubeUrl } from "@/lib/youtube";

interface URLInputSectionProps {
  onExtractTranscript: (url: string) => void;
  isLoading: boolean;
}

export const URLInputSection = ({ onExtractTranscript, isLoading }: URLInputSectionProps) => {
  const [url, setUrl] = useState("");
  const [isValid, setIsValid] = useState(true);

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // Only validate if there's a URL entered
    if (newUrl.trim().length > 0) {
      // Immediate validation for proper user feedback
      const valid = isValidYoutubeUrl(newUrl);
      setIsValid(valid);
      
      // If user pastes a URL with extra text/spaces, try to extract and auto-correct
      if (!valid && newUrl.includes('youtube.com/watch?v=')) {
        try {
          // Find the YouTube URL in the pasted text
          const urlMatch = newUrl.match(/(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/);
          if (urlMatch && urlMatch[0]) {
            setUrl(urlMatch[0]);
            setIsValid(true);
          }
        } catch (error) {
          // If extraction fails, keep the original URL
          console.log("URL extraction failed", error);
        }
      }
    } else {
      setIsValid(true); // Reset validation if empty
    }
  };

  const handleSubmit = () => {
    if (url.trim().length === 0 || !isValid) {
      setIsValid(false);
      return;
    }
    
    onExtractTranscript(url);
  };

  return (
    <section className="mb-8" aria-labelledby="url-input-heading">
      <h2 id="url-input-heading" className="text-xl font-bold mb-2 text-foreground">
        Extract Video Transcript
      </h2>
      <p className="mb-4 text-muted-foreground">
        Enter a YouTube video URL below to extract its transcript and generate an AI-powered summary.
      </p>
      <div className="bg-card p-6 rounded-lg shadow-md border border-border">
        <div className="mb-4">
          <label htmlFor="youtube-url" className="block text-sm font-medium text-foreground mb-1">
            YouTube Video URL
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <Input
                type="url"
                id="youtube-url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://www.youtube.com/watch?v=..."
                aria-describedby="url-validation"
                className={`w-full ${!isValid ? 'border-red-500 focus:ring-red-500' : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading && url.trim().length > 0) {
                    handleSubmit();
                  }
                }}
              />
              {!isValid && (
                <div id="url-validation" className="mt-1 text-sm text-red-400 p-2 bg-red-950/20 rounded-md border border-red-950/30">
                  <p className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 mt-0.5 flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" x2="12" y1="8" y2="12"/>
                      <line x1="12" x2="12.01" y1="16" y2="16"/>
                    </svg>
                    <span>
                      Please enter a valid YouTube URL. Examples:<br/>
                      <code className="text-xs bg-card/60 px-1 py-0.5 rounded border border-border">https://www.youtube.com/watch?v=VIDEOID</code><br/>
                      <code className="text-xs bg-card/60 px-1 py-0.5 rounded border border-border">https://youtu.be/VIDEOID</code>
                    </span>
                  </p>
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || url.trim().length === 0}
              className="flex items-center justify-center min-w-max h-auto py-2.5 sm:py-2 px-4 bg-primary hover:bg-primary-600 transition-colors shadow-md"
              aria-label="Extract transcript"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                  </svg>
                  <span className="hidden sm:inline">Extract Transcript</span>
                  <span className="sm:hidden">Extract</span>
                </>
              )}
            </Button>
          </div>
          <div className="mt-3 text-sm">
            <div className="p-2 bg-blue-950/20 rounded-md text-blue-400 border border-blue-950/30">
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v.01"/>
                  <path d="M12 8v4"/>
                </svg>
                <span>
                  <strong>Try an example:</strong> <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                      setIsValid(true);
                    }}
                    className="text-blue-400 underline hover:text-blue-300"
                  >
                    Rick Astley - Never Gonna Give You Up
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Pro Tips Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-zinc-800/50 flex flex-col items-center text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-medium text-zinc-200 mb-1 md:mb-2">1. Paste URL</h3>
            <p className="text-xs md:text-sm text-zinc-400">Paste any YouTube video URL in the input field above</p>
          </div>
          
          <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-zinc-800/50 flex flex-col items-center text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-medium text-zinc-200 mb-1 md:mb-2">2. Extract Transcript</h3>
            <p className="text-xs md:text-sm text-zinc-400">Click the extract button to retrieve the video transcript</p>
          </div>
          
          <div className="bg-[#121212] rounded-xl p-4 md:p-6 border border-zinc-800/50 flex flex-col items-center text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-medium text-zinc-200 mb-1 md:mb-2">3. Get Results</h3>
            <p className="text-xs md:text-sm text-zinc-400">View and use the timestamped transcript and AI summary</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default URLInputSection;
