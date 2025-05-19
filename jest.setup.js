// Polyfill for import.meta.env in Jest
globalThis.import = { meta: { env: { VITE_LOCAL_SUPABASE: 'false' } } };
