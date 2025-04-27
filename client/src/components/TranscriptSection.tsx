import { Button } from "@/components/ui/button";
import { formatTimestamp, generateTimestampUrl, extractVideoId } from "@/lib/youtube";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [showAllSegments, setShowAllSegments] = useState(false);
  const initialSegmentsCount = 10; // Default number of segments to show initially
  
  // Determine which segments to display
  const displayedTranscript = showAllSegments 
    ? transcript 
    : transcript.slice(0, initialSegmentsCount);
  
  const handleTimestampClick = (timestamp: number) => {
    if (videoId) {
      const url = generateTimestampUrl(videoId, timestamp);
      window.open(url, '_blank');
    }
  };
  
  const toggleShowAll = () => {
    setShowAllSegments(!showAllSegments);
  };

  return (
    <section aria-labelledby="transcript-heading" className="w-full block">
      <div className="bg-background p-6 rounded-lg shadow-md border-2 border-primary/30 w-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 id="transcript-heading" className="text-xl font-bold text-foreground">
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
          <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground py-12">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 13h4"/>
                <path d="M15 13h2"/>
                <path d="M7 9h2"/>
                <path d="M13 9h4"/>
                <path d="M21 15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Transcript Yet</h3>
            <p className="text-center text-muted-foreground max-w-sm mb-6">
              Enter a YouTube URL in the field above and click "Extract Transcript" to see the video transcript here.
            </p>
            
            <div className="bg-accent p-4 rounded-md text-sm text-accent-foreground border border-accent max-w-md">
              <p className="font-medium mb-2">Pro tips:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Make sure the video has captions/subtitles available for best results</li>
                <li>Official YouTube channels often have better caption quality</li>
                <li>You can use the timestamp links to navigate through the video</li>
                <li>Download the transcript to save it for later use</li>
              </ul>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex-grow flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-primary font-medium mb-2">Extracting transcript...</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              We're fetching the video transcript from YouTube. This may take a few moments
              depending on the video length. If captions aren't available, we'll create a
              transcript based on the video description.
            </p>
            <div className="flex items-center justify-center mt-6 space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "600ms" }}></div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex-grow flex flex-col items-center justify-center text-destructive py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            <p className="text-center font-medium">Failed to extract transcript</p>
            <p className="text-center text-sm mt-2 max-w-md">
              {error || "This video might not have captions available, or there was an error processing your request."}
            </p>
            <div className="mt-6 bg-destructive/10 p-4 rounded-md text-sm text-destructive border border-destructive/20 max-w-md">
              <p className="font-medium mb-2">Troubleshooting tips:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check if the video has captions or subtitles available</li>
                <li>Verify that the YouTube URL is correct and valid</li>
                <li>Try a different video with known captions</li>
                <li>If the issue persists, please try again later</li>
              </ul>
            </div>
          </div>
        )}

        {/* Transcript content */}
        {hasTranscript && (
          <div className="flex-grow flex flex-col">
            <div className="mb-4">
              <h3 className="font-medium text-lg text-foreground">{videoTitle}</h3>
              <p className="text-sm text-muted-foreground">{channelTitle} • {duration}</p>
              <div className="mt-2">
                <div className="text-xs bg-accent text-accent-foreground p-2 rounded-md border border-accent">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                    Click on any timestamp to navigate to that specific point in the YouTube video.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto bg-muted/30 p-3 sm:p-4 rounded-md font-content shadow-inner border border-border" style={{ maxHeight: "400px" }}>
              {displayedTranscript.map((segment, index) => (
                <div className="mb-4 flex flex-col sm:flex-row border-b border-border/40 pb-3 last:border-0" key={index}>
                  <div className="mb-2 sm:mb-0 sm:mr-4 sm:w-24 flex-shrink-0">
                    <button
                      onClick={() => handleTimestampClick(segment.timestamp)}
                      className="text-primary hover:text-primary-foreground font-medium inline-flex items-center bg-secondary hover:bg-secondary/80 transition-colors rounded px-3 py-2 sm:py-1.5 text-sm w-full justify-center sm:justify-start shadow-sm hover:shadow"
                      aria-label={`Jump to ${formatTimestamp(segment.timestamp)} in video`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 flex-shrink-0">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span className="whitespace-nowrap font-mono">{formatTimestamp(segment.timestamp)}</span>
                    </button>
                  </div>
                  <div className="flex-grow">
                    <p className="text-foreground">{segment.text}</p>
                  </div>
                </div>
              ))}
              
              {/* Show More/Less Button - Only display if transcript length exceeds initialSegmentsCount */}
              {hasTranscript && transcript.length > initialSegmentsCount && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleShowAll}
                    className="flex items-center text-primary border-primary hover:bg-primary/10 gap-1"
                  >
                    {showAllSegments ? (
                      <>
                        <ChevronUp size={16} />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        <span>Show More ({transcript.length - initialSegmentsCount} more segments)</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TranscriptSection;
