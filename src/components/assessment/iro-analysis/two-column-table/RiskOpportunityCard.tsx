
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { IROItem } from "../formSchema";

interface RiskOpportunityCardProps {
  item: IROItem;
  itemIndex: number;
  totalItems: number;
  getImpactLabel: (value: number) => string;
  getLikelihoodLabel: (value: number) => string;
  getRiskScoreColor: (score: number) => string;
  handleEditItem: (index: number) => void;
  handleRemoveItem: (index: number) => void;
  handleMoveItem: (index: number, direction: "up" | "down") => void;
  setupItemForEditing: (item?: IROItem) => void;
}

export function RiskOpportunityCard({
  item,
  itemIndex,
  totalItems,
  getImpactLabel,
  getLikelihoodLabel,
  getRiskScoreColor,
  handleEditItem,
  handleRemoveItem,
  handleMoveItem,
  setupItemForEditing
}: RiskOpportunityCardProps) {
  return (
    <div className="p-2 rounded-md bg-muted/30 mb-2">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium">{item.issueTitle}</h4>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleMoveItem(itemIndex, "up")}
            disabled={itemIndex === 0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleMoveItem(itemIndex, "down")}
            disabled={itemIndex === totalItems - 1}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setupItemForEditing(item);
              handleEditItem(itemIndex);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleRemoveItem(itemIndex)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <Badge variant={item.type === "risk" ? "destructive" : "default"}>
          {item.type === "risk" ? "Risk" : "Opportunity"}
        </Badge>
        <Badge variant="outline">{item.category}</Badge>
        <Badge className={getRiskScoreColor(item.riskScore || 0)}>
          Score: {item.riskScore}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
      <div className="text-sm">
        <span className="font-medium">Impact:</span> {getImpactLabel(item.impact)} · 
        <span className="font-medium"> Likelihood:</span> {getLikelihoodLabel(item.likelihood)}
      </div>
      {item.mitigationMeasures && (
        <div className="mt-2 border-t pt-2">
          <p className="text-sm font-medium">
            {item.type === "risk" ? "Mitigation Measures:" : "Enhancement Measures:"}
          </p>
          <p className="text-sm text-muted-foreground">{item.mitigationMeasures}</p>
        </div>
      )}
    </div>
  );
}
