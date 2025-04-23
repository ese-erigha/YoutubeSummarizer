import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { TranscriptSegment } from "./TranscriptSection";
import { formatTimestamp, generateTimestampUrl } from "@/lib/youtube";
import { cn } from "@/lib/utils";

interface TranscriptViewerProps {
  transcript: TranscriptSegment[];
  videoId: string;
  onTimestampClick: (timestamp: number) => void;
}

// Group transcript segments into chunks (by minutes)
const groupSegmentsByMinutes = (segments: TranscriptSegment[], minutesPerGroup: number = 2) => {
  const groups: { title: string; segments: TranscriptSegment[] }[] = [];
  
  if (segments.length === 0) return groups;
  
  let currentGroup: TranscriptSegment[] = [];
  let currentMinute = Math.floor(segments[0].timestamp / 60 / minutesPerGroup);
  let startTime = segments[0].timestamp;
  
  segments.forEach((segment) => {
    const segmentMinute = Math.floor(segment.timestamp / 60 / minutesPerGroup);
    
    if (segmentMinute !== currentMinute && currentGroup.length) {
      // Create a title for the group showing time range
      const endTime = currentGroup[currentGroup.length - 1].timestamp;
      groups.push({
        title: `${formatTimestamp(startTime)} - ${formatTimestamp(endTime)}`,
        segments: [...currentGroup],
      });
      
      // Start a new group
      currentGroup = [segment];
      currentMinute = segmentMinute;
      startTime = segment.timestamp;
    } else {
      currentGroup.push(segment);
    }
  });
  
  // Add the last group
  if (currentGroup.length) {
    const endTime = currentGroup[currentGroup.length - 1].timestamp;
    groups.push({
      title: `${formatTimestamp(startTime)} - ${formatTimestamp(endTime)}`,
      segments: currentGroup,
    });
  }
  
  return groups;
};

export const TranscriptViewer = ({ transcript, videoId, onTimestampClick }: TranscriptViewerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);

  // Group segments by every 2 minutes
  const groupedSegments = useMemo(() => {
    return groupSegmentsByMinutes(transcript, 2);
  }, [transcript]);

  // Filter segments based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedSegments;
    }

    const query = searchQuery.toLowerCase();
    return groupedSegments
      .map(group => ({
        ...group,
        segments: group.segments.filter(segment => 
          segment.text.toLowerCase().includes(query)
        )
      }))
      .filter(group => group.segments.length > 0);
  }, [groupedSegments, searchQuery]);

  // Toggle a group's expanded state
  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupTitle]: !prev[groupTitle]
    }));
  };

  // Timeline markers for navigation (every 20% of video duration)
  const timelineMarkers = useMemo(() => {
    if (transcript.length === 0) return [];
    
    const lastSegment = transcript[transcript.length - 1];
    const totalDuration = lastSegment.timestamp;
    
    // Create 6 markers (0%, 20%, 40%, 60%, 80%, 100%)
    const markers = [];
    for (let i = 0; i <= 5; i++) {
      const timestamp = Math.floor(totalDuration * (i / 5));
      // Find closest segment to this timestamp
      const closestSegment = transcript.reduce((prev, curr) => {
        return Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp) 
          ? curr 
          : prev;
      });
      
      markers.push({
        timestamp: closestSegment.timestamp,
        text: formatTimestamp(closestSegment.timestamp),
        percentage: (i * 20)
      });
    }
    
    return markers;
  }, [transcript]);

  // Handle timestamp selection in the timeline
  const handleTimelineClick = (timestamp: number) => {
    setSelectedTimestamp(timestamp);
    onTimestampClick(timestamp);
    
    // Auto-expand the group containing this timestamp
    const group = groupedSegments.find(g => 
      g.segments.some(s => s.timestamp === timestamp)
    );
    if (group) {
      setExpandedGroups(prev => ({
        ...prev,
        [group.title]: true
      }));
    }
  };

  // Calculate current position for the timeline slider
  const currentPosition = useMemo(() => {
    if (!transcript.length || !selectedTimestamp) return [0];
    
    const lastTimestamp = transcript[transcript.length - 1].timestamp;
    return [(selectedTimestamp / lastTimestamp) * 100];
  }, [transcript, selectedTimestamp]);

  return (
    <div className="flex flex-col h-full">
      {/* Search input */}
      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>
          )}
        </div>
        
        {searchQuery && (
          <div className="mt-1 text-xs text-muted-foreground">
            Found {filteredGroups.reduce((acc, group) => acc + group.segments.length, 0)} 
            {filteredGroups.reduce((acc, group) => acc + group.segments.length, 0) === 1 ? ' match' : ' matches'}
          </div>
        )}
      </div>

      {/* Interactive timeline */}
      <div className="mb-4 bg-muted p-3 rounded-md">
        <p className="text-xs text-muted-foreground mb-2">Video timeline (click to navigate)</p>
        
        <div className="relative pt-4 pb-1">
          <Slider
            value={currentPosition}
            max={100}
            step={1}
            onValueChange={(value) => {
              if (!transcript.length) return;
              
              const lastTimestamp = transcript[transcript.length - 1].timestamp;
              const targetTime = (value[0] / 100) * lastTimestamp;
              
              // Find closest segment
              const closestSegment = transcript.reduce((prev, curr) => {
                return Math.abs(curr.timestamp - targetTime) < Math.abs(prev.timestamp - targetTime) 
                  ? curr 
                  : prev;
              });
              
              handleTimelineClick(closestSegment.timestamp);
            }}
            className="cursor-pointer"
          />
          
          {/* Timeline markers */}
          <div className="relative h-0">
            {timelineMarkers.map((marker, idx) => (
              <button
                key={idx}
                className="absolute -top-4 transform -translate-x-1/2 text-xs text-primary hover:text-primary-foreground"
                style={{ left: `${marker.percentage}%` }}
                onClick={() => handleTimelineClick(marker.timestamp)}
              >
                <div className="font-mono">{marker.text}</div>
                <div className="w-0.5 h-3 bg-primary mx-auto mt-1"></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript groups */}
      <div className="flex-grow overflow-y-auto space-y-2">
        {filteredGroups.map((group, groupIdx) => (
          <div 
            key={groupIdx} 
            className={cn(
              "border border-border rounded-md overflow-hidden transition-all duration-200",
              expandedGroups[group.title] ? "shadow-md" : ""
            )}
          >
            <button
              className={cn(
                "w-full text-left p-3 flex items-center justify-between hover:bg-accent/50 transition-colors",
                expandedGroups[group.title] ? "bg-accent" : "bg-background"
              )}
              onClick={() => toggleGroup(group.title)}
            >
              <div className="flex items-center">
                <span className="text-primary font-medium mr-2">{group.title}</span>
                <span className="text-xs text-muted-foreground">
                  ({group.segments.length} {group.segments.length === 1 ? 'segment' : 'segments'})
                </span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn(
                  "transition-transform duration-200",
                  expandedGroups[group.title] ? "transform rotate-180" : ""
                )}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            
            {expandedGroups[group.title] && (
              <div className="p-3 bg-muted/30">
                {group.segments.map((segment, segmentIdx) => (
                  <div 
                    key={segmentIdx} 
                    className={cn(
                      "flex py-2 border-b border-border/30 last:border-0",
                      selectedTimestamp === segment.timestamp ? "bg-accent/30" : ""
                    )}
                  >
                    <div className="mr-4 flex-shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="font-mono text-xs h-auto py-1 px-2"
                        onClick={() => {
                          setSelectedTimestamp(segment.timestamp);
                          onTimestampClick(segment.timestamp);
                        }}
                      >
                        {formatTimestamp(segment.timestamp)}
                      </Button>
                    </div>
                    <div className="flex-grow">
                      <p className="text-foreground">
                        {searchQuery ? (
                          // Highlight search matches
                          <HighlightText text={segment.text} highlight={searchQuery} />
                        ) : (
                          segment.text
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {filteredGroups.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transcript segments found.</p>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component to highlight search matches
const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-500/30 text-foreground px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default TranscriptViewer;