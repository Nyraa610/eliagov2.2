import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Trophy, CheckCircle2, Download, GraduationCap } from "lucide-react";
import { trainingService } from "@/services/trainingService";
import { useToast } from "@/components/ui/use-toast";
import confetti from 'canvas-confetti';
import { useEngagement } from "@/hooks/useEngagement";

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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2 
            }}
          >
            {isSuccessful ? (
              <Trophy className="h-24 w-24 text-primary" />
            ) : (
              <CheckCircle2 className="h-24 w-24 text-primary" />
            )}
          </motion.div>
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
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-3xl font-bold">
              {successRate}%
            </div>
            <p className="text-muted-foreground">
              You earned {earnedPoints} out of {totalPoints} points
            </p>
          </motion.div>
          
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-medium flex items-center">
              <CheckCircle2 className="inline-block h-5 w-5 mr-2 text-green-500" />
              Key Takeaways
            </h3>
            <div className="bg-muted/50 p-4 rounded-md">
              <p className="text-sm">
                You've successfully completed this course and demonstrated your understanding of the core concepts.
                The knowledge you've gained will help you implement sustainable practices in your organization.
              </p>
            </div>
          </motion.div>
          
          {isSuccessful && (
            <motion.div
              className="border-t pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Award className="h-6 w-6 text-primary mr-2" />
                  <h3 className="font-medium">Course Certificate</h3>
                </div>
                
                {certificate ? (
                  <a 
                    href={certificate.certificate_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </a>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateCertificate}
                    disabled={loading}
                    className="gap-2"
                  >
                    <GraduationCap className="h-4 w-4" />
                    {loading ? "Generating..." : "Get Certificate"}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
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
