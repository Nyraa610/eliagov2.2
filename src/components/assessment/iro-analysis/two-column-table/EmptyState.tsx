
import { Button } from "@/components/ui/button";
import { PlusCircle, FilePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onAddItem: () => void;
  onGenerateWithAI: () => void;
}

export function EmptyState({ onAddItem, onGenerateWithAI }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-12 border rounded-md bg-muted/20"
    >
      <div className="max-w-md text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
        </motion.div>
        
        <h3 className="text-lg font-semibold">{t('assessment.iroAnalysis.emptyState.title', 'No Risks or Opportunities Added')}</h3>
        <p className="text-muted-foreground">
          {t('assessment.iroAnalysis.emptyState.description', 'Start by adding risks and opportunities manually, or let AI generate them for you based on your business context.')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onGenerateWithAI}
              variant="default"
              className="flex items-center gap-2 relative overflow-hidden group"
            >
              <FilePlus className="h-4 w-4" />
              <span className="relative z-10">{t('assessment.iroAnalysis.emptyState.generateWithAI', 'Generate with AI')}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onAddItem}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> {t('assessment.iroAnalysis.addItem', 'Add Manually')}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
