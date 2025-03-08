
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Company } from "@/services/companyService";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Mail, Plus, Shield, User, X } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

interface CompanyUserManagementProps {
  company: Company;
}

type CompanyUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_company_admin: boolean;
};

const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  make_admin: z.boolean().default(false),
});

export function CompanyUserManagement({ company }: CompanyUserManagementProps) {
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const inviteForm = useForm<z.infer<typeof inviteUserSchema>>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      make_admin: false,
    },
  });

  useEffect(() => {
    fetchCompanyUsers();
  }, [company.id]);

  const fetchCompanyUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, is_company_admin')
        .eq('company_id', company.id);
        
      if (error) {
        console.error("Error fetching company users:", error);
        throw error;
      }
      
      setUsers(data as CompanyUser[]);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load company users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitInvite = async (values: z.infer<typeof inviteUserSchema>) => {
    try {
      // Here you would integrate with your invitation service
      // For now, we'll just show a success message
      
      console.log("Inviting user:", values);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Invitation Sent",
        description: `Invitation sent to ${values.email}`,
      });
      
      inviteForm.reset();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Invitation Failed",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_company_admin: !currentStatus })
        .eq('id', userId)
        .eq('company_id', company.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? {...user, is_company_admin: !currentStatus} : user
      ));
      
      toast({
        title: "User Updated",
        description: `User role has been ${!currentStatus ? 'promoted to admin' : 'changed to regular user'}`,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Company Members</CardTitle>
            <CardDescription>
              Manage users with access to your company's account
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a new user</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your company account
                </DialogDescription>
              </DialogHeader>
              
              <Form {...inviteForm}>
                <form onSubmit={inviteForm.handleSubmit(onSubmitInvite)} className="space-y-4">
                  <FormField
                    control={inviteForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          The invitation will be sent to this email address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={inviteForm.control}
                    name="make_admin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Make company admin
                          </FormLabel>
                          <FormDescription>
                            Admins can manage company settings and other users
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No users found in your company
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-3 rounded-md border"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                      <AvatarFallback>
                        {user.full_name 
                          ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                          : user.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.full_name || user.email}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.is_company_admin && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAdminStatus(user.id, user.is_company_admin)}
                    >
                      {user.is_company_admin ? (
                        <>
                          <X className="h-3.5 w-3.5 mr-1" />
                          Remove Admin
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Make Admin
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
