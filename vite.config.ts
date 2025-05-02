
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Load environment variables based on mode
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: mode !== 'production',
    },
    define: {
      // Make sure environment variables are properly exposed to the client
      'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || mode),
      'import.meta.env.VITE_LOCAL_SUPABASE': JSON.stringify(env.VITE_LOCAL_SUPABASE || 'false')
    }
  };
});
