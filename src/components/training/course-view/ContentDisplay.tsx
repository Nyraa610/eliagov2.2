
import { QuizPlayer } from "@/components/training/index";
import { ContentItem } from "@/types/training";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface ContentDisplayProps {
  contentItems: ContentItem[];
  currentContent: ContentItem | null;
  completedContentIds: string[];
  onMarkCompleted: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onQuizComplete: (score: number) => void;
  getYouTubeVideoId: (url: string) => string | null;
  isYouTubeUrl: (url: string) => boolean;
  isLastContentInCourse?: boolean;
  courseTitle?: string;
  courseId?: string;
  totalCoursePoints?: number;
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
  isYouTubeUrl,
  isLastContentInCourse = false,
  courseTitle = "",
  courseId = "",
  totalCoursePoints = 0
}: ContentDisplayProps) => {
  if (!currentContent) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex justify-center items-center h-64">
          <p className="text-muted-foreground">
            Select a content item to begin
          </p>
        </CardContent>
      </Card>
    );
  }

  const isCompleted = completedContentIds.includes(currentContent.id);
  const currentIndex = contentItems.findIndex(item => item.id === currentContent.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < contentItems.length - 1;

  if (currentContent.content_type === "quiz") {
    return (
      <QuizPlayer 
        contentItemId={currentContent.id} 
        onComplete={onQuizComplete}
        isLastContentInCourse={isLastContentInCourse && !hasNext}
        courseTitle={courseTitle}
        courseId={courseId}
        totalCoursePoints={totalCoursePoints}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={currentContent.id}
    >
      <Card>
        <CardHeader>
          <CardTitle>{currentContent.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentContent.content_type === "video" && currentContent.video_url && (
            <>
              {isYouTubeUrl(currentContent.video_url) ? (
                <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-md mb-4">
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(currentContent.video_url)}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  ></iframe>
                </div>
              ) : (
                <div className="mb-4">
                  <video 
                    controls 
                    className="w-full rounded-md"
                    src={currentContent.video_url}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </>
          )}
          
          {currentContent.content && (
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown>{currentContent.content}</ReactMarkdown>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <div>
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!hasPrevious}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          </div>
          
          <div className="flex gap-2">
            {!isCompleted ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={onMarkCompleted}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Completed
                </Button>
              </motion.div>
            ) : (
              <Button variant="outline" disabled>
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Completed
              </Button>
            )}
            
            {hasNext && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={onNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
