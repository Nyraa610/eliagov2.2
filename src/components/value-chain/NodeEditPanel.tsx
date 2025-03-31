
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Trash } from "lucide-react";
import { NodeData } from "@/types/valueChain";
import { ValueChainNode } from "@/types/valueChain";
import { useReactFlow } from "@xyflow/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoTab } from "./node-edit/BasicInfoTab";
import { StylingAndLinksTab } from "./node-edit/StylingAndLinksTab";

interface NodeEditPanelProps {
  node: ValueChainNode;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<NodeData>) => void;
}

const NodeEditPanel = ({ node, onClose, onUpdate }: NodeEditPanelProps) => {
  const [label, setLabel] = useState(node.data.label || "");
  const [description, setDescription] = useState(node.data.description || "");
  const [color, setColor] = useState(node.data.color || "default");
  const [activeTab, setActiveTab] = useState<string>("basic");
  
  const { deleteElements } = useReactFlow();

  const handleSave = () => {
    onUpdate(node.id, { 
      label, 
      description: description || undefined,
      color: color === "default" ? undefined : color
    });
    onClose();
  };

  const handleDelete = () => {
    deleteElements({ nodes: [node] });
    onClose();
  };

  return (
    <Card className="w-96 absolute right-4 top-4 z-10 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Edit Node</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mx-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="advanced">Styling & Links</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="pt-2">
          <CardContent className="space-y-4">
            <BasicInfoTab 
              label={label}
              setLabel={setLabel}
              description={description}
              setDescription={setDescription}
            />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="advanced" className="pt-2">
          <CardContent className="space-y-4">
            <StylingAndLinksTab 
              nodeId={node.id}
              initialColor={color}
              onColorChange={setColor}
            />
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="flex justify-between">
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash className="h-4 w-4 mr-1" /> Delete
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
};

export default NodeEditPanel;
