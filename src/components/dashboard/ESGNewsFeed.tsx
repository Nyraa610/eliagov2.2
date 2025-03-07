
import { useEffect, useState } from "react";
import { BarChart3, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { rssService } from "@/services/rssService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface NewsItem {
  id: string;
  title: string;
  date: string;
  source: string;
  link: string;
}

export const ESGNewsFeed = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  
  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await rssService.fetchESGNews(language);
        setNewsItems(items);
      } catch (err) {
        setError("Failed to load ESG news. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNews();
  }, [language]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" /> ESG News & Updates
        </CardTitle>
        <CardDescription>
          Latest insights from the sustainability world
        </CardDescription>
        <Tabs defaultValue="en" className="mt-2" onValueChange={(value) => setLanguage(value as 'en' | 'fr')}>
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="fr">French</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-8 flex justify-center items-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>{error}</p>
            </div>
          ) : newsItems.length > 0 ? (
            newsItems.map((item) => (
              <div key={item.id} className={cn(
                "border-b pb-3 last:border-b-0 last:pb-0",
                "hover:bg-muted/20 -mx-6 px-6 py-2 rounded transition-colors"
              )}>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group"
                >
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors flex items-start">
                    <span>{item.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                    <span className="text-xs text-primary">{item.source}</span>
                  </div>
                </a>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <p>No news items available.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
