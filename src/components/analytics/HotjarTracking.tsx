
import { useEffect } from 'react';

interface HotjarTrackingProps {
  siteId: string;
  hotjarVersion?: number;
}

export const HotjarTracking = ({ siteId, hotjarVersion = 6 }: HotjarTrackingProps) => {
  useEffect(() => {
    // Only run in the browser
    if (typeof window !== 'undefined') {
      // Initialize Hotjar
      (function(h: any, o: any, t: any, j: any, a: any, r: any) {
        h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
        h._hjSettings = { hjid: siteId, hjsv: hotjarVersion };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script'); r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    }
  }, [siteId, hotjarVersion]);

  // This component doesn't render anything
  return null;
};
