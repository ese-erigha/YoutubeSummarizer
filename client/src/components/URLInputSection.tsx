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
      setIsValid(isValidYoutubeUrl(newUrl));
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
              />
              {!isValid && (
                <p id="url-validation" className="mt-1 text-sm text-red-600">
                  Please enter a valid YouTube URL.
                </p>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || url.trim().length === 0}
              className="flex items-center justify-center min-w-max"
              aria-label="Extract transcript"
            >
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" x2="12" y1="15" y2="3"/>
                </svg>
              )}
              Extract Transcript
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Enter a YouTube video URL to extract its transcript and generate a summary.
          </p>
        </div>
      </div>
    </section>
  );
};

export default URLInputSection;
