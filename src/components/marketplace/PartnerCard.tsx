
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Mail } from "lucide-react";
import { MarketplacePartner } from "@/services/marketplace";

interface PartnerCardProps {
  partner: MarketplacePartner;
  onContact: (partner: MarketplacePartner) => void;
}

export function PartnerCard({ partner, onContact }: PartnerCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start space-x-4">
        {partner.logo_url ? (
          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
            <img 
              src={partner.logo_url} 
              alt={`${partner.name} logo`} 
              className="w-full h-full object-contain" 
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">
              {partner.name.charAt(0)}
            </span>
          </div>
        )}
        <div>
          <CardTitle>{partner.name}</CardTitle>
          <CardDescription>
            {partner.categories.map((category, index) => (
              <Badge key={index} variant="outline" className="mr-1 mb-1">
                {category}
              </Badge>
            ))}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-500">
          {partner.description || "No description provided."}
        </p>
        
        {partner.services.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Services:</h4>
            <ul className="text-sm text-gray-500 list-disc list-inside">
              {partner.services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>
        )}
        
        {partner.locations.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Available in:</h4>
            <div className="flex flex-wrap gap-1">
              {partner.locations.map((location, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {location}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        {partner.website_url && (
          <Button variant="outline" size="sm" asChild className="text-xs">
            <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Visit Website
            </a>
          </Button>
        )}
        <Button size="sm" onClick={() => onContact(partner)} className="flex items-center gap-1">
          <Mail className="h-3 w-3" />
          Contact
        </Button>
      </CardFooter>
    </Card>
  );
}
