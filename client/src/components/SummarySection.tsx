import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SummarySectionProps {
  transcript: string;
  videoTitle: string;
  summary: string | null;
  isSummaryLoading: boolean;
  summaryError: string | null;
  onGenerateSummary: () => void;
  onRegenerateSummary: () => void;
  hasTranscript: boolean;
}

const SummarySection = ({
  transcript,
  videoTitle,
  summary,
  isSummaryLoading,
  summaryError,
  onGenerateSummary,
  onRegenerateSummary,
  hasTranscript,
}: SummarySectionProps) => {
  return (
    <section aria-labelledby="summary-heading">
      <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 id="summary-heading" className="text-xl font-bold text-gray-800">
            Summary
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerateSummary}
            disabled={!summary || isSummaryLoading}
            className="text-primary hover:text-primary-foreground hover:bg-primary border-primary text-sm px-3 py-1 h-auto flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw mr-1">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
            Regenerate
          </Button>
        </div>

        {/* Initial state */}
        {!hasTranscript && !summary && !isSummaryLoading && !summaryError && (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-400 py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <path d="M12 11h4"/>
              <path d="M12 16h4"/>
              <path d="M8 11h.01"/>
              <path d="M8 16h.01"/>
            </svg>
            <p className="text-center">
              After extracting the transcript, click "Generate Summary" to create an AI-powered summary.
            </p>
          </div>
        )}

        {/* Generate summary button */}
        {hasTranscript && !summary && !isSummaryLoading && (!summaryError || (summaryError && summaryError.includes("not found"))) && (
          <div className="flex-grow flex flex-col items-center justify-center py-12">
            <Button
              onClick={onGenerateSummary}
              className="bg-primary text-white px-6 py-3 h-auto flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m5 16 3 3 8.5-8.5-3-3L5 16"/>
                <path d="M13 6h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>
              </svg>
              Generate Summary
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isSummaryLoading && (
          <div className="flex-grow flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-primary">Generating summary with AI...</p>
          </div>
        )}

        {/* Error state - but not for 'not found' errors */}
        {summaryError && !summaryError.includes("not found") && (
          <div className="flex-grow flex flex-col items-center justify-center text-red-500 py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            <p className="text-center font-medium">Failed to generate summary.</p>
            <p className="text-center text-sm mt-2">
              {summaryError || "There was an error processing your request. Please try again."}
            </p>
          </div>
        )}

        {/* Summary content */}
        {summary && (
          <div className="flex-grow overflow-y-auto bg-gray-50 p-4 rounded-md font-content">
            <div dangerouslySetInnerHTML={{ 
              __html: summary
                .replace(/\n\n/g, '<br/><br/>')
                .replace(/\n/g, '<br/>')
                .replace(/• (.*?)(?=<br\/>|$)/g, '<li>$1</li>')
                .replace(/<li>/g, '<ul class="list-disc pl-5 space-y-2"><li>')
                .replace(/<\/li><br\/><br\/>/g, '</li></ul><br/>')
                .replace(/<\/li><br\/>/g, '</li></ul>')
            }} />
          </div>
        )}
      </div>
    </section>
  );
};

export default SummarySection;
