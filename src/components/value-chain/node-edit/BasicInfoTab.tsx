
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoTabProps {
  label: string;
  setLabel: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
}

export function BasicInfoTab({ label, setLabel, description, setDescription }: BasicInfoTabProps) {
  return (
    <>
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
    </>
  );
}
