import { Button } from "@/components/ui/button";
import { formatTimestamp, generateTimestampUrl, extractVideoId } from "@/lib/youtube";
import { useState, useEffect } from "react";

export interface TranscriptSegment {
  text: string;
  timestamp: number;
}

interface TranscriptSectionProps {
  videoUrl: string;
  videoTitle: string;
  channelTitle: string;
  duration: string;
  transcript: TranscriptSegment[];
  isLoading: boolean;
  error: string | null;
  onDownloadTranscript: () => void;
}

const TranscriptSection = ({
  videoUrl,
  videoTitle,
  channelTitle,
  duration,
  transcript,
  isLoading,
  error,
  onDownloadTranscript,
}: TranscriptSectionProps) => {
  const videoId = extractVideoId(videoUrl);
  const hasTranscript = transcript && transcript.length > 0;
  
  const handleTimestampClick = (timestamp: number) => {
    if (videoId) {
      const url = generateTimestampUrl(videoId, timestamp);
      window.open(url, '_blank');
    }
  };

  return (
    <section className="lg:col-span-2" aria-labelledby="transcript-heading">
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 id="transcript-heading" className="text-xl font-bold text-gray-800">
            Transcript
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadTranscript}
            disabled={!hasTranscript}
            className="text-primary hover:text-primary-foreground hover:bg-primary border-primary text-sm px-3 py-1 h-auto flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download mr-1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" x2="12" y1="15" y2="3"/>
            </svg>
            Download
          </Button>
        </div>

        {/* Initial state */}
        {!isLoading && !error && !hasTranscript && (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-400 py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <path d="M7 13h4"/>
              <path d="M15 13h2"/>
              <path d="M7 9h2"/>
              <path d="M13 9h4"/>
              <path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>
            </svg>
            <p className="text-center">
              Enter a YouTube URL and click "Extract Transcript" to see the video transcript here.
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex-grow flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-primary">Extracting transcript...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex-grow flex flex-col items-center justify-center text-red-500 py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            <p className="text-center font-medium">Failed to extract transcript.</p>
            <p className="text-center text-sm mt-2">
              {error || "This video might not have captions available, or there was an error processing your request."}
            </p>
          </div>
        )}

        {/* Transcript content */}
        {hasTranscript && (
          <div className="flex-grow flex flex-col">
            <div className="mb-4">
              <h3 className="font-medium text-lg text-gray-900">{videoTitle}</h3>
              <p className="text-sm text-gray-500">{channelTitle} • {duration}</p>
              <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                <p className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  Click on any timestamp to navigate to that specific point in the YouTube video.
                </p>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto bg-gray-50 p-4 rounded-md font-content">
              {transcript.map((segment, index) => (
                <div className="mb-4" key={index}>
                  <button
                    onClick={() => handleTimestampClick(segment.timestamp)}
                    className="text-primary hover:text-primary-700 font-medium inline-flex items-center"
                    aria-label={`Jump to ${formatTimestamp(segment.timestamp)} in video`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {formatTimestamp(segment.timestamp)}
                  </button>
                  <p className="mt-1">{segment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TranscriptSection;
