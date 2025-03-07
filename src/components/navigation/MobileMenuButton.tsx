
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const MobileMenuButton = ({ isOpen, onToggle }: MobileMenuButtonProps) => {
  return (
    <Button variant="ghost" size="icon" onClick={onToggle} className="ml-2">
      {isOpen ? (
        <Cross1Icon className="h-5 w-5" />
      ) : (
        <HamburgerMenuIcon className="h-5 w-5" />
      )}
    </Button>
  );
};
