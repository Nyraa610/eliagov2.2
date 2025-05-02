/// <reference types="vite/client" />
    /// <reference types="vite/client" />

    interface ImportMetaEnv {
      readonly VITE_LOCAL_SUPABASE: string;
      readonly VITE_APP_ENV: string;
      // ...other environment variables...
    }

    interface ImportMeta {
      readonly env: ImportMetaEnv;
    }
// Declare the Stripe Pricing Table element for TypeScript
declare namespace JSX {
  interface IntrinsicElements {
    'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'pricing-table-id': string;
      'publishable-key': string;
    }, HTMLElement>;
  }
}

interface ImportMetaEnv {
  readonly VITE_LOCAL_SUPABASE: string;
  readonly VITE_APP_ENV: string;
  // ...other environment variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
