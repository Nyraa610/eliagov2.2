
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface HotjarTrackingProps {
  siteId?: string;
  hotjarVersion?: number;
}

export const HotjarTracking = ({ siteId, hotjarVersion = 6 }: HotjarTrackingProps) => {
  const initialized = useRef(false);

  useEffect(() => {
    // Only run in the browser and if not already initialized
    if (typeof window !== 'undefined' && !initialized.current) {
      const loadHotjar = async () => {
        try {
          // If siteId is not provided, attempt to fetch from Supabase
          let hjid = siteId;
          
          if (!hjid) {
            // Fetch HOTJAR_SITE_ID from Supabase function
            const { data, error } = await supabase.functions.invoke('get-hotjar-site-id');
            if (!error && data?.siteId) {
              hjid = data.siteId;
            } else {
              console.warn('Failed to get Hotjar site ID from Supabase. Hotjar tracking disabled.');
              return;
            }
          }

          if (!hjid) {
            console.warn('No Hotjar site ID available. Hotjar tracking disabled.');
            return;
          }

          // Initialize Hotjar
          (function(h: any, o: any, t: any, j: any, a: any, r: any) {
            h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
            h._hjSettings = { hjid, hjsv: hotjarVersion };
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script'); r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
          })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=', null, null);
          
          initialized.current = true;
          console.log(`Hotjar initialized with site ID: ${hjid}`);
        } catch (error) {
          console.error('Error initializing Hotjar:', error);
        }
      };
      
      loadHotjar();
    }
  }, [siteId, hotjarVersion]);

  // This component doesn't render anything
  return null;
};
