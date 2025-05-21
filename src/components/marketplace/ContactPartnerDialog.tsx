
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { MarketplacePartner, marketplaceService } from "@/services/marketplace";
import { Loader2 } from "lucide-react";

interface ContactPartnerDialogProps {
  partner: MarketplacePartner | null;
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
}

export function ContactPartnerDialog({ partner, isOpen, onClose, companyId }: ContactPartnerDialogProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    
    setIsSubmitting(true);
    
    try {
      await marketplaceService.createLead({
        partner_id: partner.id,
        user_id: "placeholder", // Will be replaced by auth.uid() in the RLS policy
        company_id: companyId,
        message
      });
      
      toast({
        title: "Contact request sent",
        description: `Your message has been sent to ${partner.name}. They will contact you soon.`,
      });
      
      onClose();
      setMessage("");
    } catch (error) {
      console.error("Error sending contact request:", error);
      toast({
        title: "Error",
        description: "Failed to send your contact request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!partner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Contact {partner.name}</DialogTitle>
            <DialogDescription>
              Send a message to this ESG solution provider. They will contact you directly to discuss your needs.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message (optional)
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the provider about your specific needs or questions..."
                rows={5}
              />
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>By contacting this provider, you agree to share your contact information with them.</p>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
