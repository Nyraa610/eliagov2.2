
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NodeData } from "@/types/valueChain";
import { X, Trash } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValueChainNode } from "@/types/valueChain";
import { useReactFlow } from "@xyflow/react";

interface NodeEditPanelProps {
  node: ValueChainNode;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<NodeData>) => void;
}

const COLOR_PRESETS = [
  { name: "Default", value: "" },
  { name: "Blue", value: "#DBEAFE" },
  { name: "Green", value: "#DCFCE7" },
  { name: "Red", value: "#FEE2E2" },
  { name: "Yellow", value: "#FEF9C3" },
  { name: "Purple", value: "#F3E8FF" },
  { name: "Orange", value: "#FFEDD5" },
  { name: "Teal", value: "#CCFBF1" },
  { name: "Pink", value: "#FCE7F3" },
  { name: "Gray", value: "#F3F4F6" },
];

export default function NodeEditPanel({ node, onClose, onUpdate }: NodeEditPanelProps) {
  const [label, setLabel] = useState(node.data.label || "");
  const [description, setDescription] = useState(node.data.description || "");
  const [color, setColor] = useState(node.data.color || "");
  const [customColor, setCustomColor] = useState(color.startsWith("#") && !COLOR_PRESETS.some(preset => preset.value === color) ? color : "#FFFFFF");
  
  const { deleteElements } = useReactFlow();

  const handleColorChange = (value: string) => {
    setColor(value);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setColor(newColor);
  };

  const handleSave = () => {
    onUpdate(node.id, { 
      label, 
      description: description || undefined,
      color: color || undefined
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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="node-label">Label</Label>
          <Input 
            id="node-label" 
            value={label} 
            onChange={(e) => setLabel(e.target.value)} 
            placeholder="Node Label"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="node-description">Description</Label>
          <Textarea 
            id="node-description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Add a description..."
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="node-color">Color</Label>
          <Select value={color} onValueChange={handleColorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              {COLOR_PRESETS.map((preset) => (
                <SelectItem key={preset.name} value={preset.value}>
                  <div className="flex items-center gap-2">
                    {preset.value ? (
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.value }}
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 border" />
                    )}
                    {preset.name}
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="custom">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-300 via-blue-300 to-green-300 border" />
                  Custom Color
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {color === "custom" && (
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-12 h-8 p-1"
              />
              <Input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                className="flex-1"
                placeholder="#RRGGBB"
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash className="h-4 w-4 mr-1" /> Delete
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
