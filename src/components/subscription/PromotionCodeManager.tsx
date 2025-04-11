
import { useState, useEffect } from "react";
import { Copy, Plus, Trash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type PromoCode = {
  id: string;
  code: string;
  discount_percentage: number;
  redemptions: number;
  totalCommission: number;
  paidCommission: number;
  pendingCommission: number;
  created_at: string;
  is_active: boolean;
};

export function PromotionCodeManager() {
  const [isLoading, setIsLoading] = useState(true);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [newCodePercent, setNewCodePercent] = useState(15);
  const [customCode, setCustomCode] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("partner-promo-code", {
        body: { action: "list" }
      });
      
      if (error) {
        console.error("Error fetching promo codes:", error);
        toast({
          title: "Error Loading Codes",
          description: "Could not load your promotion codes. Please try again later.",
          variant: "destructive"
        });
        return;
      }
      
      setPromoCodes(data.promoCodes || []);
    } catch (error) {
      console.error("Exception fetching promo codes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPromoCode = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("partner-promo-code", {
        body: { 
          action: "create",
          code: customCode || undefined,
          discount: newCodePercent
        }
      });
      
      if (error) {
        console.error("Error creating promo code:", error);
        toast({
          title: "Error Creating Code",
          description: "Could not create your promotion code. Please try again later.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Code Created",
        description: `Your promotion code ${data.promoCode.code} has been created successfully.`,
      });
      
      setIsDialogOpen(false);
      setCustomCode("");
      setNewCodePercent(15);
      
      // Refresh the list
      fetchPromoCodes();
    } catch (error) {
      console.error("Exception creating promo code:", error);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: "Promotion code copied to clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Partner Promotion Codes</CardTitle>
          <CardDescription>
            Create and manage special discount codes for referrals
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Create Code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Promotion Code</DialogTitle>
              <DialogDescription>
                Create a custom discount code to share with your network.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Custom Code (Optional)</Label>
                <Input
                  id="code"
                  placeholder="PARTNER25"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to generate a random code.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="discount">Discount Percentage</Label>
                <Input
                  id="discount"
                  type="number"
                  min="5"
                  max="30"
                  value={newCodePercent}
                  onChange={(e) => setNewCodePercent(parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createPromoCode}>
                Create Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any promotion codes yet.</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Your First Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 font-medium text-sm text-gray-500 pb-2">
              <div>Code</div>
              <div>Redemptions</div>
              <div>Commission</div>
              <div className="text-right">Actions</div>
            </div>
            
            {promoCodes.map((code) => (
              <div key={code.id} className="grid grid-cols-4 gap-4 items-center p-4 border rounded bg-white">
                <div className="space-y-1">
                  <div className="font-medium">{code.code}</div>
                  <div className="text-xs text-muted-foreground">
                    {code.discount_percentage}% discount
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">{code.redemptions}</span> uses
                </div>
                
                <div className="space-y-1">
                  <div className="font-medium">${code.totalCommission.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    ${code.pendingCommission.toFixed(2)} pending
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard(code.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
