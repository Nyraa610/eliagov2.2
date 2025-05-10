
import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPanelContent } from "@/components/admin/panel/AdminPanelContent";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import { Loader2 } from "lucide-react";

export default function AdminPanel() {
  const { isAuthenticated, hasRequiredRole, isLoading } = useAuthProtection("admin");

  if (isLoading) {
    return (
      <AdminLayout 
        title="Admin Panel" 
        description="Loading..."
      >
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Verifying permissions...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated || !hasRequiredRole) {
    return (
      <AdminLayout 
        title="Access Denied" 
        description="You do not have permission to access this page."
      >
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold text-destructive mb-2">Unauthorized Access</h2>
          <p className="text-muted-foreground mb-4">Please contact an administrator if you believe this is an error.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Admin Panel" 
      description="Manage your platform settings and content"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AdminPanelContent />
      </motion.div>
    </AdminLayout>
  );
}
