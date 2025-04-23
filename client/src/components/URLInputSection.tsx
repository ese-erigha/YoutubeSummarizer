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
      <h2 id="url-input-heading" className="text-xl font-bold mb-2 text-gray-800">
        Extract Video Transcript
      </h2>
      <p className="mb-4 text-gray-600">
        Enter a YouTube video URL below to extract its transcript and generate an AI-powered summary.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-1">
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
                <div id="url-validation" className="mt-1 text-sm text-red-600 p-2 bg-red-50 rounded-md border border-red-100">
                  <p className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 mt-0.5 flex-shrink-0">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" x2="12" y1="8" y2="12"/>
                      <line x1="12" x2="12.01" y1="16" y2="16"/>
                    </svg>
                    <span>
                      Please enter a valid YouTube URL. Examples:<br/>
                      <code className="text-xs bg-white px-1 py-0.5 rounded">https://www.youtube.com/watch?v=VIDEOID</code><br/>
                      <code className="text-xs bg-white px-1 py-0.5 rounded">https://youtu.be/VIDEOID</code>
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
            <div className="p-2 bg-blue-50 rounded-md text-blue-700 border border-blue-100">
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
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Rick Astley - Never Gonna Give You Up
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default URLInputSection;
