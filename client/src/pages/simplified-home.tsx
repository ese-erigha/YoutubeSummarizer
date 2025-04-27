import React from 'react';
import { URLInputSection } from '@/components/URLInputSection';
import TranscriptSection from '@/components/TranscriptSection';
import SummarySection from '@/components/SummarySection';

const SimplifiedHome = () => {
  // Minimal set of mock props to display the components
  const mockProps = {
    handleExtractTranscript: (url: string) => console.log('Extract transcript:', url),
    isLoadingTranscript: false,
    youtubeUrl: '',
    videoDetails: null,
    transcript: [],
    handleDownloadTranscript: () => console.log('Download transcript'),
    summary: null,
    isLoadingSummary: false,
    summaryError: null,
    handleGenerateSummary: () => console.log('Generate summary'),
    handleRegenerateSummary: () => console.log('Regenerate summary'),
  };

  return (
    <div className="min-h-screen p-4">
      <div className="fixed right-4 top-20 z-50">
        <a 
          href="/" 
          className="bg-blue-500 text-white px-4 py-2 rounded-md font-bold flex items-center shadow-lg"
        >
          Back to Normal Layout
        </a>
      </div>
      {/* Plain vertical stack layout with hard-coded styling */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Section 1: URL Input */}
        <div style={{ width: '100%', border: '2px solid blue', padding: '20px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Extract Video Transcript</h2>
          <URLInputSection 
            onExtractTranscript={mockProps.handleExtractTranscript}
            isLoading={mockProps.isLoadingTranscript}
            inputUrl={mockProps.youtubeUrl}
          />
        </div>
        
        {/* Section 2: Transcript (with forced width and display properties) */}
        <div style={{ 
          width: '100%', 
          border: '2px solid green', 
          padding: '20px',
          display: 'block',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Transcript Section</h2>
          <TranscriptSection
            videoUrl={mockProps.youtubeUrl}
            videoTitle={"Example Video"}
            channelTitle={"Example Channel"}
            duration={"10:30"}
            transcript={[]}
            isLoading={false}
            error={null}
            onDownloadTranscript={mockProps.handleDownloadTranscript}
          />
        </div>
        
        {/* Section 3: Summary (with forced width and display properties) */}
        <div style={{ 
          width: '100%', 
          border: '2px solid red', 
          padding: '20px',
          display: 'block',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Summary Section</h2>
          <SummarySection
            transcript={"Example transcript text"}
            videoTitle={"Example Video"}
            summary={null}
            isSummaryLoading={false}
            summaryError={null}
            onGenerateSummary={mockProps.handleGenerateSummary}
            onRegenerateSummary={mockProps.handleRegenerateSummary}
            hasTranscript={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SimplifiedHome;