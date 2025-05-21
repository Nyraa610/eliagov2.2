
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnerCard } from "./PartnerCard";
import { ContactPartnerDialog } from "./ContactPartnerDialog";
import { MarketplacePartner, MarketplaceRecommendation, marketplaceService } from "@/services/marketplace";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface MarketplaceRecommendationsProps {
  actionPlanData?: any;
  className?: string;
}

export function MarketplaceRecommendations({ actionPlanData, className }: MarketplaceRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<MarketplaceRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<MarketplacePartner | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const { user } = useAuth();
  const { company } = useCompanyProfile();
  const { toast } = useToast();

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        // Try to get existing recommendations
        const userRecommendations = await marketplaceService.getRecommendationsForUser(user.id);
        
        // If no recommendations exist, generate them based on action plan
        if (userRecommendations.length === 0 && actionPlanData) {
          await marketplaceService.generateRecommendations(
            user.id, 
            company?.id || null, 
            actionPlanData
          );
          // Fetch the newly created recommendations
          const newRecommendations = await marketplaceService.getRecommendationsForUser(user.id);
          setRecommendations(newRecommendations);
        } else {
          setRecommendations(userRecommendations);
        }
      } catch (error) {
        console.error("Error loading marketplace recommendations:", error);
        toast({
          title: "Error loading recommendations",
          description: "There was an error loading partner recommendations.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRecommendations();
  }, [user, company, actionPlanData, toast]);

  const handleContactPartner = (partner: MarketplacePartner) => {
    setSelectedPartner(partner);
    setIsContactDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>ESG Solution Providers</CardTitle>
          <CardDescription>
            Finding the right partners to help implement your action plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>ESG Solution Providers</CardTitle>
          <CardDescription>
            Finding the right partners to help implement your action plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="mb-4">Please sign in to see partner recommendations.</p>
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle>ESG Solution Providers</CardTitle>
          <CardDescription>
            Finding the right partners to help implement your action plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                No solution providers are available for your specific needs yet.
              </p>
              <Button asChild variant="outline">
                <Link to="/marketplace/apply">Become a Solution Provider</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((recommendation) => (
                recommendation.partner && (
                  <PartnerCard
                    key={recommendation.id}
                    partner={recommendation.partner}
                    onContact={handleContactPartner}
                  />
                )
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <ContactPartnerDialog
        partner={selectedPartner}
        isOpen={isContactDialogOpen}
        onClose={() => {
          setIsContactDialogOpen(false);
          setSelectedPartner(null);
        }}
        companyId={company?.id}
      />
    </>
  );
}
