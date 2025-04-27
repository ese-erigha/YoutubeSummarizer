import { Button } from "@/components/ui/button";

/**
 * Format summary text to properly display introduction, bullet points, and conclusion
 * based on the new summary structure format
 */
function formatSummary(summaryText: string): string {
  // Split the summary into sections based on line breaks
  const lines = summaryText.split('\n').filter(line => line.trim().length > 0);
  
  let html = '';
  let inBulletList = false;
  let bulletListContent = '';
  
  // Process each line 
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect bullet points (could start with •, -, *, or numbers like "1.", "2.")
    const isBulletPoint = Boolean(
      line.match(/^[•\-*]|^\d+\.\s/) || 
      line.includes('* ') || 
      line.startsWith('- ') ||
      line.match(/^\[\d+\]/)
    );
    
    if (isBulletPoint) {
      // If this is our first bullet point, start the list
      if (!inBulletList) {
        // If we had content before, close it properly
        if (html.length > 0) {
          html = `<div class="mb-4 leading-relaxed">${html}</div>`;
        }
        inBulletList = true;
        bulletListContent = '';
      }
      
      // Format the bullet point with proper HTML
      // Remove bullet marker and trim
      const bulletContent = line.replace(/^[•\-*]|^\d+\.\s|^\[\d+\]|^\s*-\s*|\*\s*/, '').trim();
      bulletListContent += `<li class="mb-2">${bulletContent}</li>`;
    } 
    else {
      // If we were in a bullet list and now we're not, close the list
      if (inBulletList) {
        html += `<ul class="list-disc pl-5 space-y-1 my-4 ml-2 border-l-2 border-primary/20 pl-6 py-2">
                  ${bulletListContent}
                </ul>`;
        inBulletList = false;
        bulletListContent = '';
        
        // This line is likely a conclusion, style it differently
        html += `<div class="mt-4 text-foreground font-medium">${line}</div>`;
      } 
      // Normal paragraph text (introduction or other sections)
      else {
        // If it's a heading (starts with "Main Topic" or similar)
        if (/^(main|key|important|conclusion)/i.test(line)) {
          html += `<h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">${line}</h3>`;
        } 
        // Otherwise it's a regular paragraph
        else {
          if (html.length > 0) html += ' '; // Add space between paragraphs in the same section
          html += line;
        }
      }
    }
  }
  
  // Close any open bullet list at the end
  if (inBulletList) {
    html += `<ul class="list-disc pl-5 space-y-1 my-4 ml-2 border-l-2 border-primary/20 pl-6 py-2">
              ${bulletListContent}
            </ul>`;
  } 
  // If we never had a bullet list, wrap the content in a div
  else if (!html.startsWith('<div')) {
    html = `<div class="mb-4 leading-relaxed text-foreground">${html}</div>`;
  }
  
  return html;
}

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
      <div className="bg-background p-6 rounded-lg shadow-md border border-border h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 id="summary-heading" className="text-xl font-bold text-foreground">
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
          <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground py-12">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <path d="M12 11h4"/>
                <path d="M12 16h4"/>
                <path d="M8 11h.01"/>
                <path d="M8 16h.01"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Summary Yet</h3>
            <p className="text-center text-muted-foreground max-w-sm mb-6">
              After extracting the transcript, click "Generate Summary" to create an AI-powered summary of the video.
            </p>
            
            <div className="bg-accent text-accent-foreground border border-accent p-4 rounded-md text-sm max-w-md">
              <p className="font-medium mb-2">What to expect:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>A concise overview of the video content</li>
                <li>Key points organized into bullet points</li>
                <li>Main topics and insights identified</li>
                <li>Option to regenerate if you want a different summary</li>
              </ul>
            </div>
          </div>
        )}

        {/* Generate summary button */}
        {hasTranscript && !summary && !isSummaryLoading && (!summaryError || (summaryError && summaryError.includes("not found"))) && (
          <div className="flex-grow flex flex-col items-center justify-center py-12">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-foreground mb-2">Transcript Ready!</h3>
              <p className="text-muted-foreground max-w-sm">
                Your transcript has been successfully extracted. 
                Now you can generate an AI-powered summary with one click!
              </p>
            </div>
            
            <div>
              <Button
                onClick={onGenerateSummary}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 h-auto flex items-center rounded-md shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="m5 16 3 3 8.5-8.5-3-3L5 16"/>
                  <path d="M13 6h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>
                </svg>
                Generate AI Summary
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-4">
              Powered by GPT-4o AI technology
            </p>
          </div>
        )}

        {/* Loading state */}
        {isSummaryLoading && (
          <div className="flex-grow flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
            <p className="text-primary font-medium mb-2">Generating summary with AI...</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Our AI model is analyzing the transcript to create a concise summary.
              This typically takes 5-10 seconds depending on the length of the transcript.
            </p>
            <div className="mt-6 bg-accent text-accent-foreground border border-accent p-3 rounded-md text-xs max-w-sm">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v.01"/>
                  <path d="M12 8v4"/>
                </svg>
                The summary will highlight key points of the video in a structured format.
              </p>
            </div>
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
            <p className="text-center font-medium">Failed to generate summary</p>
            <p className="text-center text-sm mt-2 max-w-md">
              {summaryError || "There was an error processing your request. Please try again."}
            </p>
            <div className="mt-6 bg-destructive/10 border border-destructive/20 p-4 rounded-md text-sm text-destructive max-w-md">
              <p className="font-medium mb-2">Troubleshooting tips:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check your internet connection and try again</li>
                <li>The transcript may be too long or complex for processing</li>
                <li>Our AI service may be experiencing high demand</li>
                <li>Try with a shorter video or wait a few minutes and retry</li>
              </ul>
            </div>
            <Button
              onClick={onGenerateSummary}
              variant="default"
              className="mt-6 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M21 21v-5h-5"></path>
              </svg>
              Try Again
            </Button>
          </div>
        )}

        {/* Summary content */}
        {summary && (
          <div className="flex-grow overflow-y-auto bg-muted/30 p-4 sm:p-6 rounded-md font-content shadow-inner border border-border" style={{ maxHeight: "500px" }}>
            <div className="prose prose-blue max-w-none">
              <div dangerouslySetInnerHTML={{ 
                __html: formatSummary(summary)
              }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SummarySection;
