
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { 
  Bell, 
  FileText, 
  CheckCircle, 
  RefreshCw, 
  User, 
  Calendar,
  Check
} from "lucide-react";
import { 
  Notification, 
  notificationService 
} from "@/services/notificationService";
import { formatDistanceToNow } from "date-fns";

export function NotificationsTab() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications(50);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications."
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        setNotifications(notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        ));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const success = await notificationService.markAllAsRead();
      if (success) {
        setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
        toast({
          title: "Success",
          description: "All notifications marked as read."
        });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark all notifications as read."
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assessment_completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'document_uploaded':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'deliverable_created':
        return <FileText className="h-6 w-6 text-purple-500" />;
      case 'message':
        return <Bell className="h-6 w-6 text-orange-500" />;
      default:
        return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Notifications</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchNotifications}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground font-medium">No notifications yet</p>
            <p className="text-sm text-muted-foreground">You'll be notified when clients submit assessments or upload documents</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.is_read ? "opacity-70" : ""}>
              <CardContent className="p-4">
                <div className="flex">
                  <div className="mr-4 flex-shrink-0">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-base font-medium">{notification.title}</h4>
                      {notification.id && !notification.is_read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => markAsRead(notification.id!)}
                          className="h-8 px-2"
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                      {notification.created_at && (
                        <div className="flex items-center mr-4">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </div>
                      )}
                      {notification.sender_id && (
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          From: {(notification as any).sender?.full_name || 'Unknown user'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
