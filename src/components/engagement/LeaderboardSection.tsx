
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  engagementService, 
  LeaderboardEntry, 
  LeaderboardPeriod, 
  LeaderboardScope 
} from '@/services/engagement';
import { Trophy, Users, Building, Star, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

export function LeaderboardSection() {
  const [scope, setScope] = useState<LeaderboardScope>('company');
  const [period, setPeriod] = useState<LeaderboardPeriod>('all-time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUserId(data.user.id);
      }
    };
    
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await engagementService.getLeaderboard(scope, period);
      setLeaderboard(data);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [scope, period]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription>See who's leading in sustainability achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={scope} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <TabsList>
              <TabsTrigger 
                value="company" 
                onClick={() => setScope('company')}
                className="flex items-center"
              >
                <Building className="h-4 w-4 mr-2" />
                Company
              </TabsTrigger>
              <TabsTrigger 
                value="global" 
                onClick={() => setScope('global')}
                className="flex items-center"
              >
                <Users className="h-4 w-4 mr-2" />
                Global
              </TabsTrigger>
            </TabsList>

            <TabsList>
              <TabsTrigger 
                value="weekly" 
                onClick={() => setPeriod('weekly')}
              >
                Weekly
              </TabsTrigger>
              <TabsTrigger 
                value="monthly" 
                onClick={() => setPeriod('monthly')}
              >
                Monthly
              </TabsTrigger>
              <TabsTrigger 
                value="all-time" 
                onClick={() => setPeriod('all-time')}
              >
                All Time
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={scope} className="space-y-0 mt-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <p>Loading leaderboard...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No data available for this leaderboard.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.user_id}
                    className={`flex items-center justify-between p-3 rounded-md ${
                      entry.user_id === currentUserId ? 'bg-primary/10' : index % 2 === 0 ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div 
                        className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                          index === 0 ? 'bg-yellow-200 text-yellow-800' :
                          index === 1 ? 'bg-gray-200 text-gray-800' :
                          index === 2 ? 'bg-amber-200 text-amber-800' :
                          'bg-primary/10 text-primary'
                        }`}
                      >
                        {index + 1}
                      </div>
                      
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(entry.full_name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <p className="text-sm font-medium">
                          {entry.full_name || 'Anonymous User'}
                          {entry.user_id === currentUserId && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>
                          )}
                        </p>
                        {scope === 'global' && entry.company_name && (
                          <p className="text-xs text-muted-foreground">{entry.company_name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-primary mr-1" />
                        <span className="text-sm font-medium">{entry.total_points}</span>
                      </div>
                      
                      <div className="flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        <Medal className="h-3 w-3 mr-1" />
                        <span>Lvl {entry.level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
