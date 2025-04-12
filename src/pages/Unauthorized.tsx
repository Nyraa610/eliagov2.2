
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { HotjarTracking } from "@/components/analytics/HotjarTracking";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <HotjarTracking />
      <div className="container mx-auto px-4 page-header-spacing">
        <motion.div 
          className="max-w-lg mx-auto text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-24 h-24 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-6"
          >
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Sorry, you don't have permission to access this page. 
            This area requires administrator privileges.
          </p>
          
          <Button onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
