
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const COLOR_PRESETS = [
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

interface ColorPickerProps {
  initialColor: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ initialColor, onColorChange }: ColorPickerProps) {
  const [color, setColor] = useState(initialColor || "default");
  const [customColor, setCustomColor] = useState(
    color.startsWith("#") && !COLOR_PRESETS.some(preset => preset.value === color) 
      ? color 
      : "#FFFFFF"
  );

  const handleColorChange = (value: string) => {
    setColor(value);
    onColorChange(value);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setColor(newColor);
    onColorChange(newColor);
  };

  return (
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
  );
}
