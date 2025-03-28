
import React from "react";
import { motion } from "framer-motion";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPanelContent } from "@/components/admin/panel/AdminPanelContent";
import { useAdminPanelAuth } from "@/components/admin/panel/useAdminPanelAuth";
import { Loader2 } from "lucide-react";

export default function AdminPanel() {
  const { isAdmin, isLoading } = useAdminPanelAuth();

  if (isLoading) {
    return (
      <AdminLayout 
        title="Admin Panel" 
        description="Loading..."
      >
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) {
    return null;
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
