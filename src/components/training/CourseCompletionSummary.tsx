
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
  const { toast, celebrateSuccess } = useToast();
  const { trackActivity } = useEngagement();
  const successRate = Math.round((earnedPoints / totalPoints) * 100);
  const isSuccessful = successRate >= 75;
  const [showAchievement, setShowAchievement] = useState(false);

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
    
    // Show achievement toast
    celebrateSuccess(
      "Course Completed!",
      `You've completed ${courseTitle} with a score of ${successRate}%`
    );
    
    // Delayed achievement banner appearance for courses with high scores
    if (successRate > 85) {
      setTimeout(() => setShowAchievement(true), 1000);
    }
    
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
  }, [isSuccessful, trackActivity, courseId, courseTitle, earnedPoints, successRate, celebrateSuccess]);

  const handleGenerateCertificate = async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const cert = await trainingService.generateCertificate(courseId);
      setCertificate(cert);
      
      toast({
        title: "Certificate generated!",
        description: "Your certificate is ready to download",
        variant: "celebration"
      });
      
      // Trigger certificate celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        shapes: ['square'],
        colors: ['#FFD700', '#9b87f5', '#7E69AB']
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
        
        {showAchievement && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-yellow-50 dark:bg-yellow-900/20 border-y border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex items-center justify-center gap-3 py-3 px-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/50 p-1.5">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <div className="text-yellow-600 dark:text-yellow-300">
                      🏆
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              <div>
                <motion.p 
                  className="font-medium text-yellow-800 dark:text-yellow-300"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Achievement Unlocked: Sustainability Expert
                </motion.p>
                <motion.p 
                  className="text-sm text-yellow-700 dark:text-yellow-400"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  You scored in the top tier of learners!
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
        
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={onContinue} 
              className="relative overflow-hidden group"
            >
              <span className="relative z-10">Continue</span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CourseCompletionSummary;
