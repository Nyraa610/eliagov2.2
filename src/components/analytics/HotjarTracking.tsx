
import { useEffect, useRef } from 'react';
import hotjar from '@hotjar/browser';
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
      const initHotjar = async () => {
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

          // Initialize Hotjar using the official package
          hotjar.init(parseInt(hjid, 10), hotjarVersion);
          
          initialized.current = true;
          console.log(`Hotjar initialized with site ID: ${hjid}`);
        } catch (error) {
          console.error('Error initializing Hotjar:', error);
        }
      };
      
      initHotjar();
    }
  }, [siteId, hotjarVersion]);

  // This component doesn't render anything
  return null;
};
