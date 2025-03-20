
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface ProductInputListProps {
  products: string[];
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
  onUpdateProduct: (index: number, value: string) => void;
}

export function ProductInputList({
  products,
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct
}: ProductInputListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Key Products</Label>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onAddProduct}
          type="button"
          className="h-8 gap-1 text-xs"
        >
          <Plus className="h-3 w-3" /> Add Product
        </Button>
      </div>
      
      {products.map((product, index) => (
        <div key={index} className="flex gap-2">
          <Input
            placeholder={`Product ${index + 1}`}
            value={product}
            onChange={(e) => onUpdateProduct(index, e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveProduct(index)}
            type="button"
            disabled={products.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
