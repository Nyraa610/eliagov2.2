
interface RSSItem {
  id: string;
  title: string;
  date: string;
  source: string;
  link: string;
}

export const rssService = {
  async fetchESGNews(language: 'en' | 'fr' = 'en'): Promise<RSSItem[]> {
    try {
      const url = language === 'en' 
        ? 'https://esgnews.com/feed/'
        : 'https://www.esresponsable.org/spip.php?page=backend';
      
      // We need to use a CORS proxy since these RSS feeds don't have CORS headers
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(corsProxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
      }
      
      const data = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");
      
      // Handle different RSS formats (RSS 2.0 and Atom)
      const items = xmlDoc.querySelectorAll('item, entry');
      
      return Array.from(items).map((item, index) => {
        // Get title
        const titleElement = item.querySelector('title');
        const title = titleElement ? titleElement.textContent || '' : '';
        
        // Get publication date
        let dateElement = item.querySelector('pubDate, published');
        const dateStr = dateElement ? dateElement.textContent || '' : '';
        const date = dateStr ? new Date(dateStr) : new Date();
        
        // Format date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];
        
        // Get link
        const linkElement = item.querySelector('link');
        const link = linkElement?.textContent || 
                    linkElement?.getAttribute('href') || '';
        
        // Get source name
        const source = language === 'en' ? 'ESG News' : 'ESResponsable';
        
        return {
          id: `${index}-${formattedDate}`,
          title: title,
          date: formattedDate,
          source: source,
          link: link
        };
      }).slice(0, 5); // Limit to 5 news items
    } catch (error) {
      console.error("Error fetching ESG news:", error);
      return [];
    }
  }
};
