
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function UserSearchBar({ searchQuery, setSearchQuery }: UserSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search users by email or name..." 
        className="pl-10"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}
