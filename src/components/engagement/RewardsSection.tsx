
import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { engagementService, Reward, UserEngagementStats } from '@/services/engagement';
import { Gift, CheckCircle, AlertCircle } from 'lucide-react';

export function RewardsSection() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userStats, setUserStats] = useState<UserEngagementStats | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const [availableRewards, stats] = await Promise.all([
        engagementService.getAvailableRewards(),
        engagementService.getUserStats()
      ]);
      
      setRewards(availableRewards);
      setUserStats(stats);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleRedeemReward = async (rewardId: string) => {
    if (!userStats) return;
    
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return;
    
    if (userStats.total_points < reward.points_required) {
      toast({
        title: "Not enough points",
        description: `You need ${reward.points_required - userStats.total_points} more points to redeem this reward.`,
        variant: "destructive"
      });
      return;
    }
    
    setRedeeming(rewardId);
    
    try {
      const success = await engagementService.redeemReward(rewardId);
      
      if (success) {
        // Update local state
        setUserStats({
          ...userStats,
          total_points: userStats.total_points - reward.points_required
        });
        
        toast({
          title: "Reward Redeemed!",
          description: `You've successfully redeemed: ${reward.name}`,
        });
      } else {
        toast({
          title: "Redemption Failed",
          description: "There was an error processing your reward. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      toast({
        title: "Redemption Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rewards</CardTitle>
          <CardDescription>Redeem your points for rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <p>Loading rewards...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Rewards
        </CardTitle>
        <CardDescription>Redeem your points for exclusive rewards</CardDescription>
      </CardHeader>
      <CardContent>
        {rewards.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No rewards available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => {
              const canAfford = userStats && userStats.total_points >= reward.points_required;
              
              return (
                <Card key={reward.id} className={`border ${canAfford ? 'border-primary/20' : 'border-muted-foreground/20'}`}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">{reward.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
                    <div className="flex items-center mt-2">
                      {canAfford ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        {reward.points_required} points required
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      variant={canAfford ? "default" : "outline"} 
                      className="w-full"
                      disabled={!canAfford || redeeming === reward.id}
                      onClick={() => handleRedeemReward(reward.id)}
                    >
                      {redeeming === reward.id ? "Redeeming..." : "Redeem Reward"}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
