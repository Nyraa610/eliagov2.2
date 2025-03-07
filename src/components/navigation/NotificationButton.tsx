
import { BellIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

export const NotificationButton = () => {
  return (
    <Button variant="ghost" size="icon" className="mr-2">
      <BellIcon className="h-5 w-5" />
    </Button>
  );
};
