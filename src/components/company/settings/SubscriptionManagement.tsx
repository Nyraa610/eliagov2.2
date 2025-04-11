
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Package, Clock, Calendar, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Company } from "@/services/company/types";

interface SubscriptionManagementProps {
  company: Company;
}

export function SubscriptionManagement({ company }: SubscriptionManagementProps) {
  const { subscriptionStatus, checkSubscription, isLoading } = useSubscription();
  const navigate = useNavigate();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription & Billing
        </CardTitle>
        <CardDescription>
          Manage your subscription plan and payment details
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-20 bg-gray-200 animate-pulse rounded"></div>
          </div>
        ) : subscriptionStatus?.isActive ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-medium text-lg">{subscriptionStatus.plan} Plan</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" /> Active
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-md p-3">
                <div className="text-sm text-muted-foreground">Current Period</div>
                <div className="flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    Until {formatDate(subscriptionStatus.currentPeriodEnd)}
                  </span>
                </div>
              </div>
              
              {subscriptionStatus.trialEnd && (
                <div className="border rounded-md p-3">
                  <div className="text-sm text-muted-foreground">Trial Status</div>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Ends on {formatDate(subscriptionStatus.trialEnd)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {subscriptionStatus.willCancel && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-3 mt-4">
                <div className="flex items-start gap-2">
                  <XCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Your subscription will end on {formatDate(subscriptionStatus.currentPeriodEnd)}</p>
                    <p className="text-sm mt-1">You won't be charged again, but you can still use the service until this date.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-md p-6 text-center">
            <Package className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium">No Active Subscription</h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              You're currently on the Free plan with limited features.
            </p>
            <Button onClick={() => navigate("/pricing")}>
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-stretch sm:flex-row sm:justify-between sm:items-center border-t p-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/pricing")}
          className="mb-2 sm:mb-0"
        >
          Change Plan
        </Button>
        
        {subscriptionStatus?.isActive && (
          <Button 
            variant="ghost" 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => {
              // This would typically link to a Stripe customer portal
              window.open("https://billing.stripe.com/p/login/test_xxxxx", "_blank");
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Manage Billing
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
