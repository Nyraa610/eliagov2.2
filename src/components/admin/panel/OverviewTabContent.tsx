
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Book, Users, Award } from "lucide-react";
import { motion } from "framer-motion";

export function OverviewTabContent() {
  const { toast } = useToast();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Book className="h-5 w-5 mr-2 text-primary" />
              Training Management
            </CardTitle>
            <CardDescription>
              Manage courses, modules and content
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm">
              Create and manage training courses, modules, and content for your users.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/admin/training")}
            >
              Go to Instructor Panel
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm">
              View and manage user accounts, roles, and permissions.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate("/admin/users")}
            >
              User Management
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Certification
            </CardTitle>
            <CardDescription>
              View and manage certificates
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm">
              Manage user certifications and view completion statistics.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                toast({
                  title: "Coming Soon",
                  description: "This feature will be available in a future update."
                });
              }}
            >
              Certification Management
            </Button>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
}
