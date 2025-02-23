
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg z-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
            <a href="#assessment" className="text-gray-600 hover:text-primary transition-colors">Assessment</a>
            <a href="#training" className="text-gray-600 hover:text-primary transition-colors">Training</a>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
