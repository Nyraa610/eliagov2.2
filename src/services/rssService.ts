
interface RSSItem {
  id: string;
  title: string;
  date: string;
  source: string;
  link: string;
}

export const rssService = {
  async fetchESGNews(language: 'en' | 'fr' | 'el' | 'es' = 'en'): Promise<RSSItem[]> {
    try {
      // Select RSS feed URL based on language
      let url = '';
      
      switch (language) {
        case 'fr':
          url = 'https://www.esresponsable.org/spip.php?page=backend';
          break;
        case 'el':
          // Fallback to English for Greek as we don't have a Greek source
          url = 'https://esgnews.com/feed/';
          break;
        case 'es':
          // Fallback to English for Spanish as we don't have a Spanish source
          url = 'https://esgnews.com/feed/';
          break;
        case 'en':
        default:
          url = 'https://esgnews.com/feed/';
          break;
      }
      
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
        
        // Get source name based on language
        let source = 'ESG News';
        if (language === 'fr') {
          source = 'ESResponsable';
        } else if (language === 'el') {
          source = 'ESG News (EN)';
        } else if (language === 'es') {
          source = 'ESG News (EN)';
        }
        
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
