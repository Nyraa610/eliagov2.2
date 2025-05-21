
import React from 'react';
import { Package } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

export function MarketplaceNotification() {
  return (
    <Card className="bg-primary/5 border-primary/20 mb-6">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-primary/10 rounded-full p-2 mr-4">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm sm:text-base">Need help implementing your action plan?</h3>
            <p className="text-sm text-muted-foreground">Connect with trusted ESG delivery providers in our marketplace</p>
          </div>
        </div>
        <Button size="sm" asChild>
          <Link to="/assessment/action-plan/providers">Explore Providers</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
