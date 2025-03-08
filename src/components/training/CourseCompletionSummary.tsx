
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trainingService } from "@/services/trainingService";
import { useToast } from "@/components/ui/use-toast";
import confetti from 'canvas-confetti';
import { useEngagement } from "@/hooks/useEngagement";
import { CompletionIcon } from "./course-completion/CompletionIcon";
import { SuccessRate } from "./course-completion/SuccessRate";
import { KeyTakeaways } from "./course-completion/KeyTakeaways";
import { Certificate } from "./course-completion/Certificate";

interface CourseCompletionSummaryProps {
  courseId: string;
  courseTitle: string;
  totalPoints: number;
  earnedPoints: number;
  onContinue: () => void;
}

const CourseCompletionSummary: React.FC<CourseCompletionSummaryProps> = ({
  courseId,
  courseTitle,
  totalPoints,
  earnedPoints,
  onContinue
}) => {
  const [certificate, setCertificate] = useState<{ id: string; certificate_url: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { trackActivity } = useEngagement();
  const successRate = Math.round((earnedPoints / totalPoints) * 100);
  const isSuccessful = successRate >= 75;

  useEffect(() => {
    // Track course completion
    trackActivity({
      activity_type: 'complete_course',
      points_earned: 50,
      metadata: {
        course_id: courseId,
        course_title: courseTitle,
        earned_points: earnedPoints,
        success_rate: successRate
      }
    }, true);
    
    if (isSuccessful) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        confetti({
          particleCount: 3,
          angle: randomInRange(55, 125),
          spread: randomInRange(50, 70),
          origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.4) },
          colors: ['#FFD700', '#FFA500', '#4CAF50', '#2196F3'],
          disableForReducedMotion: true
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [isSuccessful, trackActivity, courseId, courseTitle, earnedPoints, successRate]);

  const handleGenerateCertificate = async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const cert = await trainingService.generateCertificate(courseId);
      setCertificate(cert);
      
      toast({
        title: "Certificate generated!",
        description: "Your certificate is ready to download",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to generate certificate",
        description: error.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/20 p-8 flex flex-col items-center justify-center">
          <CompletionIcon isSuccessful={isSuccessful} />
          <motion.h1 
            className="text-2xl font-bold mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isSuccessful ? "Congratulations!" : "Course Completed!"}
          </motion.h1>
        </div>
        
        <CardHeader>
          <CardTitle className="text-center">
            {courseTitle} - Course Summary
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <SuccessRate 
            earnedPoints={earnedPoints} 
            totalPoints={totalPoints} 
            successRate={successRate} 
          />
          
          <KeyTakeaways />
          
          <Certificate 
            certificate={certificate}
            loading={loading}
            isSuccessful={isSuccessful}
            onGenerateCertificate={handleGenerateCertificate}
          />
        </CardContent>
        
        <CardFooter className="justify-center pb-6">
          <Button onClick={onContinue}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CourseCompletionSummary;
