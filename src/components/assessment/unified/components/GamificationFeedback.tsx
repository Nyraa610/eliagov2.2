
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Star, Award, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GamificationFeedbackProps {
  type: 'section' | 'assessment' | 'milestone';
  message: string;
  show: boolean;
  points?: number;
  onAnimationComplete?: () => void;
}

export function GamificationFeedback({ 
  type, 
  message, 
  show, 
  points = 0,
  onAnimationComplete 
}: GamificationFeedbackProps) {
  useEffect(() => {
    if (show) {
      // Different confetti effects based on type
      if (type === 'assessment') {
        // Large celebration for assessment completion
        const end = Date.now() + 3000;
        
        const interval = setInterval(() => {
          if (Date.now() > end) {
            clearInterval(interval);
            return;
          }
          
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6, x: Math.random() }
          });
        }, 250);
        
        return () => clearInterval(interval);
      } else if (type === 'milestone') {
        // Medium celebration for milestones
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.7 }
        });
      } else {
        // Small pop for section completions
        confetti({
          particleCount: 20,
          spread: 30,
          origin: { y: 0.8 }
        });
      }
    }
  }, [show, type]);

  // Different animations based on type
  const animations = {
    assessment: {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0, opacity: 0 },
      transition: { type: "spring", stiffness: 500, damping: 30, duration: 0.8 }
    },
    milestone: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -50, opacity: 0 },
      transition: { type: "spring", stiffness: 300, damping: 25, duration: 0.5 }
    },
    section: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    }
  };

  // Select the icon based on type
  const Icon = type === 'assessment' ? Trophy : type === 'milestone' ? Award : Star;
  
  // Only render if show is true
  if (!show) return null;
  
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onAnimationComplete}
    >
      <motion.div
        className="max-w-sm w-full mx-4"
        {...animations[type]}
        onAnimationComplete={onAnimationComplete}
      >
        <Card className="border-primary/20 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <motion.div 
              className="rounded-full bg-primary/10 p-3"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1.2 }}
              transition={{ repeat: 3, repeatType: "reverse", duration: 1 }}
            >
              <Icon className="h-12 w-12 text-primary" />
            </motion.div>
            
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-primary">
                {type === 'assessment' ? 'Congratulations!' : 'Great job!'}
              </h3>
              <p className="text-muted-foreground mt-2">{message}</p>
              
              {points > 0 && (
                <motion.div
                  className="mt-4 text-primary-foreground bg-primary px-4 py-2 rounded-full inline-block"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <span>+{points} points earned!</span>
                </motion.div>
              )}
            </motion.div>
            
            <motion.p
              className="text-sm text-muted-foreground mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Tap anywhere to continue
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
