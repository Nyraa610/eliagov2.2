
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="space-y-2">
      <Label>Products</Label>
      {products.map((product, index) => (
        <div key={`product-${index}`} className="flex gap-2 mb-2">
          <Input
            value={product}
            onChange={e => onUpdateProduct(index, e.target.value)}
            placeholder={`Product ${index + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemoveProduct(index)}
            disabled={products.length <= 1}
          >
            ×
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddProduct}
        className="mt-1"
      >
        Add Product
      </Button>
    </div>
  );
}
