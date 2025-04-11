
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthProtection } from "@/hooks/useAuthProtection";

export default function SubscriptionManager() {
  const [plans, setPlans] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { hasRequiredRole, isLoading: authLoading } = useAuthProtection('admin');

  useEffect(() => {
    if (!authLoading && hasRequiredRole) {
      fetchSubscriptionData();
    }
  }, [authLoading, hasRequiredRole]);

  const fetchSubscriptionData = async () => {
    setIsLoading(true);
    try {
      // Fetch plans
      const { data: plansData, error: plansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price");

      if (plansError) throw plansError;
      setPlans(plansData);

      // Fetch promotions
      const { data: promoData, error: promoError } = await supabase
        .from("promotion_codes")
        .select("*, code_redemptions(count)")
        .order("created_at", { ascending: false });

      if (promoError) throw promoError;
      setPromotions(promoData);

      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          profiles:user_id(email, full_name),
          subscription_plans(name, price)
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (subsError) throw subsError;
      setSubscriptions(subsData);
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!hasRequiredRole) {
    return <div>You don't have permission to access this page.</div>;
  }

  return (
    <AdminLayout title="Subscription Management">
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="promotions">Promotion Codes</TabsTrigger>
          <TabsTrigger value="subscriptions">User Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Manage your subscription plans and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded">
                      <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {plans.map((plan) => (
                    <div key={plan.id} className="p-4 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{plan.name}</h3>
                          <p className="text-gray-500">{plan.description}</p>
                          <div className="mt-2">
                            <span className="font-medium">${plan.price}</span> per month
                            {plan.trial_days > 0 && (
                              <span className="ml-2 text-sm text-green-600">
                                {plan.trial_days}-day trial
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Promotion Codes</CardTitle>
                <CardDescription>Manage discount and partner promotion codes</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Create Code</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Promotion Code</DialogTitle>
                    <DialogDescription>
                      Create a new discount code for your users.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Code</Label>
                      <Input id="code" placeholder="SUMMER25" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount (%)</Label>
                      <Input id="discount" type="number" defaultValue="15" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-uses">Max Redemptions (Optional)</Label>
                      <Input id="max-uses" type="number" placeholder="Unlimited" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Code</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded">
                      <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {promotions.map((promo) => (
                    <div key={promo.id} className="p-4 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{promo.code}</h3>
                          <p className="text-sm text-gray-500">
                            {promo.discount_percentage}% discount | 
                            {promo.code_redemptions[0]?.count || 0} uses
                          </p>
                          {promo.expires_at && (
                            <p className="text-sm text-gray-500">
                              Expires: {new Date(promo.expires_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          {promo.is_active ? (
                            <Button variant="outline" size="sm">Disable</Button>
                          ) : (
                            <Button variant="outline" size="sm">Enable</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>User Subscriptions</CardTitle>
              <CardDescription>View and manage user subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded">
                      <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="p-4 border rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {sub.profiles.full_name || sub.profiles.email}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Plan: {sub.subscription_plans.name} | 
                            Status: <span className={`font-medium ${
                              sub.status === 'active' || sub.status === 'trialing' 
                                ? 'text-green-600' 
                                : 'text-gray-600'
                            }`}>{sub.status}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            Started: {new Date(sub.created_at).toLocaleDateString()}
                          </p>
                          {sub.current_period_end && (
                            <p className="text-sm text-gray-500">
                              Next billing: {new Date(sub.current_period_end).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
