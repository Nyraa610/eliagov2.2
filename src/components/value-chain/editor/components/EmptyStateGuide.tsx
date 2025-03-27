
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Wand2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface EmptyStateGuideProps {
  onOpenAutomatedBuilder: () => void;
}

export function EmptyStateGuide({ onOpenAutomatedBuilder }: EmptyStateGuideProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-muted/40 rounded-lg p-5 text-center mb-4">
      <div className="max-w-sm mx-auto space-y-4">
        <div>
          <div className="bg-primary/10 p-2 rounded-full inline-block mb-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">{t("valueChain.emptyState.title", "Create Your Value Chain")}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {t(
              "valueChain.emptyState.description",
              "Build a comprehensive value chain to identify ESG impacts and optimization opportunities."
            )}
          </p>
        </div>
        
        <div className="grid gap-2">
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={onOpenAutomatedBuilder}
          >
            <Wand2 className="h-4 w-4" /> {t("valueChain.emptyState.generateWithAI", "Generate with AI")}
          </Button>
          <p className="text-xs text-muted-foreground">
            {t(
              "valueChain.emptyState.aiDescription",
              "Let AI analyze your business and generate a detailed value chain model."
            )}
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-muted px-2 text-muted-foreground">
              {t("valueChain.emptyState.or", "or")}
            </span>
          </div>
        </div>
        
        <div>
          <p className="text-xs mb-1">
            {t("valueChain.emptyState.manualDescription", "Use the toolbar above to add nodes and create your value chain manually.")}
          </p>
          <div className="flex justify-center">
            <ArrowRight className="h-4 w-4 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
