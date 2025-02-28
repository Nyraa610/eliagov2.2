import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen } from "lucide-react";
import { ContentItem } from "@/types/training";
import QuizPlayer from "@/components/training/QuizPlayer";
import React from "react";

interface ContentDisplayProps {
  contentItems: ContentItem[];
  currentContent: ContentItem | null;
  completedContentIds: string[];
  onMarkCompleted: () => Promise<void>;
  onPrevious: () => void;
  onNext: () => void;
  onQuizComplete: (score: number) => void;
  getYouTubeVideoId: (url: string) => string | null;
  isYouTubeUrl: (url: string) => boolean;
}

export const ContentDisplay = ({
  contentItems,
  currentContent,
  completedContentIds,
  onMarkCompleted,
  onPrevious,
  onNext,
  onQuizComplete,
  getYouTubeVideoId,
  isYouTubeUrl
}: ContentDisplayProps) => {
  const renderContentItem = () => {
    if (!currentContent) return null;

    switch (currentContent.content_type) {
      case "text":
        return (
          <div className="prose max-w-none dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: currentContent.content || "" }} />
          </div>
        );
      case "video":
        if (currentContent.video_url) {
          // Check if it's a YouTube video
          if (isYouTubeUrl(currentContent.video_url)) {
            const videoId = getYouTubeVideoId(currentContent.video_url);
            if (videoId) {
              return (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-md overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  {currentContent.content && (
                    <div className="prose max-w-none dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
                    </div>
                  )}
                </div>
              );
            }
          }
          
          // Otherwise, it's a direct video URL
          return (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <video 
                  src={currentContent.video_url} 
                  controls 
                  className="w-full h-full" 
                />
              </div>
              {currentContent.content && (
                <div className="prose max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />
                </div>
              )}
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center h-64 bg-muted rounded-md">
            <p className="text-muted-foreground">No video available</p>
          </div>
        );
      case "quiz":
        return (
          <div className="space-y-4">
            {currentContent.content && (
              <div className="prose max-w-none dark:prose-invert mb-4">
                <div dangerouslySetInnerHTML={{ __html: currentContent.content || "" }} />
              </div>
            )}
            <QuizPlayer 
              contentItemId={currentContent.id} 
              onComplete={onQuizComplete} 
            />
          </div>
        );
      default:
        return null;
    }
  };

  const EmptyContent = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No content selected</h3>
      <p className="text-muted-foreground text-center max-w-md">
        Select a module and content item from the sidebar to begin learning.
      </p>
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{currentContent?.title || 'Select content to view'}</CardTitle>
      </CardHeader>
      <CardContent>
        {currentContent ? (
          <div className="space-y-6">
            {renderContentItem()}
            
            {currentContent.content_type !== "quiz" && (
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  disabled={!contentItems.length || contentItems[0].id === currentContent.id}
                  onClick={onPrevious}
                >
                  Previous
                </Button>
                
                {completedContentIds.includes(currentContent.id) ? (
                  <Button variant="outline" disabled>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completed
                  </Button>
                ) : (
                  <Button onClick={onMarkCompleted}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}
                
                <Button
                  disabled={!contentItems.length || contentItems[contentItems.length - 1].id === currentContent.id}
                  onClick={onNext}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        ) : (
          <EmptyContent />
        )}
      </CardContent>
    </Card>
  );
};
