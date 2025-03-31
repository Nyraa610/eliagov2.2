import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NodeData } from "@/types/valueChain";
import { X, Trash, Palette, Link } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValueChainNode } from "@/types/valueChain";
import { useReactFlow } from "@xyflow/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NodeEditPanelProps {
  node: ValueChainNode;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<NodeData>) => void;
}

const COLOR_PRESETS = [
  { name: "Default", value: "default" },
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

const NodeEditPanel = ({ node, onClose, onUpdate }: NodeEditPanelProps) => {
  const [label, setLabel] = useState(node.data.label || "");
  const [description, setDescription] = useState(node.data.description || "");
  const [color, setColor] = useState(node.data.color || "default");
  const [customColor, setCustomColor] = useState(color.startsWith("#") && !COLOR_PRESETS.some(preset => preset.value === color) ? color : "#FFFFFF");
  const [activeTab, setActiveTab] = useState<string>("basic");
  
  const { deleteElements, getNodes, addEdges } = useReactFlow();

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
      color: color === "default" ? undefined : color
    });
    onClose();
  };

  const handleDelete = () => {
    deleteElements({ nodes: [node] });
    onClose();
  };

  // Connect to the nearest node in the specified direction
  const connectToNearestNode = (direction: 'left' | 'right' | 'top' | 'bottom') => {
    const nodes = getNodes();
    const currentNode = nodes.find(n => n.id === node.id);
    
    if (!currentNode) return;
    
    let filteredNodes: any[] = [];
    let sortFunction: (a: any, b: any) => number;
    let connectionConfig: {
      source: string;
      target: string;
      type: string;
      id: string;
    };
    
    switch(direction) {
      case 'left':
        filteredNodes = nodes.filter(n => 
          n.id !== node.id &&
          n.position.x < currentNode.position.x &&
          Math.abs(n.position.y - currentNode.position.y) < 150
        );
        sortFunction = (a, b) => 
          (currentNode.position.x - a.position.x) - (currentNode.position.x - b.position.x);
        
        if (filteredNodes.length > 0) {
          filteredNodes.sort(sortFunction);
          connectionConfig = {
            source: filteredNodes[0].id,
            target: node.id,
            type: 'floating',
            id: `e-${filteredNodes[0].id}-${node.id}`
          };
        }
        break;
        
      case 'right':
        filteredNodes = nodes.filter(n => 
          n.id !== node.id &&
          n.position.x > currentNode.position.x &&
          Math.abs(n.position.y - currentNode.position.y) < 150
        );
        sortFunction = (a, b) => 
          (a.position.x - currentNode.position.x) - (b.position.x - currentNode.position.x);
        
        if (filteredNodes.length > 0) {
          filteredNodes.sort(sortFunction);
          connectionConfig = {
            source: node.id,
            target: filteredNodes[0].id,
            type: 'floating',
            id: `e-${node.id}-${filteredNodes[0].id}`
          };
        }
        break;
        
      case 'top':
        filteredNodes = nodes.filter(n => 
          n.id !== node.id &&
          n.position.y < currentNode.position.y &&
          Math.abs(n.position.x - currentNode.position.x) < 150
        );
        sortFunction = (a, b) => 
          (currentNode.position.y - a.position.y) - (currentNode.position.y - b.position.y);
        
        if (filteredNodes.length > 0) {
          filteredNodes.sort(sortFunction);
          connectionConfig = {
            source: filteredNodes[0].id,
            target: node.id,
            type: 'floating',
            id: `e-${filteredNodes[0].id}-${node.id}`
          };
        }
        break;
        
      case 'bottom':
        filteredNodes = nodes.filter(n => 
          n.id !== node.id &&
          n.position.y > currentNode.position.y &&
          Math.abs(n.position.x - currentNode.position.x) < 150
        );
        sortFunction = (a, b) => 
          (a.position.y - currentNode.position.y) - (b.position.y - currentNode.position.y);
        
        if (filteredNodes.length > 0) {
          filteredNodes.sort(sortFunction);
          connectionConfig = {
            source: node.id,
            target: filteredNodes[0].id,
            type: 'floating',
            id: `e-${node.id}-${filteredNodes[0].id}`
          };
        }
        break;
    }
    
    if (filteredNodes.length > 0) {
      addEdges([connectionConfig]);
    }
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
          </CardContent>
        </TabsContent>
        
        <TabsContent value="advanced" className="pt-2">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <Palette className="mr-2 h-4 w-4" />
                <Label htmlFor="node-color">Color</Label>
              </div>
              
              <Select value={color} onValueChange={handleColorChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_PRESETS.map((preset) => (
                    <SelectItem key={preset.name} value={preset.value}>
                      <div className="flex items-center gap-2">
                        {preset.value !== "default" ? (
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
            
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <Link className="mr-2 h-4 w-4" />
                <Label>Connect Node</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => connectToNearestNode('left')} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  Connect Left
                </Button>
                <Button 
                  onClick={() => connectToNearestNode('right')} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  Connect Right
                </Button>
                <Button 
                  onClick={() => connectToNearestNode('top')} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  Connect Top
                </Button>
                <Button 
                  onClick={() => connectToNearestNode('bottom')} 
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  Connect Bottom
                </Button>
              </div>
            </div>
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
