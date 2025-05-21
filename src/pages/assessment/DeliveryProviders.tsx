
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Sample provider data - in a real app this would come from an API
const providers = [
  {
    id: 1,
    name: "EcoSolutions Ltd",
    logo: "https://placehold.co/100x100?text=ES",
    description: "Specializing in carbon footprint reduction and renewable energy solutions.",
    rating: 4.8,
    reviews: 124,
    specialties: ["Carbon Reduction", "Renewable Energy", "Sustainability Reporting"],
    costRange: "€€€",
    location: "France, Germany, Spain",
    completedProjects: 78
  },
  {
    id: 2,
    name: "Green Consultancy Group",
    logo: "https://placehold.co/100x100?text=GCG",
    description: "Expert advisors for ESG strategy implementation and regulatory compliance.",
    rating: 4.6,
    reviews: 89,
    specialties: ["ESG Strategy", "Regulatory Compliance", "Stakeholder Engagement"],
    costRange: "€€€€",
    location: "UK, France, Netherlands",
    completedProjects: 112
  },
  {
    id: 3,
    name: "Sustainable Solutions Inc.",
    logo: "https://placehold.co/100x100?text=SSI",
    description: "Full-service sustainability consultancy focusing on practical implementation.",
    rating: 4.5,
    reviews: 76,
    specialties: ["Supply Chain Optimization", "Waste Management", "Circular Economy"],
    costRange: "€€",
    location: "Spain, Italy, Portugal",
    completedProjects: 64
  },
  {
    id: 4,
    name: "Climate Impact Partners",
    logo: "https://placehold.co/100x100?text=CIP",
    description: "Specialized in climate risk assessment and adaptation strategies.",
    rating: 4.9,
    reviews: 103,
    specialties: ["Climate Risk", "Adaptation Planning", "Net Zero Strategies"],
    costRange: "€€€€",
    location: "Global",
    completedProjects: 95
  },
  {
    id: 5,
    name: "ESG Implementation Experts",
    logo: "https://placehold.co/100x100?text=EIE",
    description: "Practical implementation of ESG initiatives with measurable results.",
    rating: 4.7,
    reviews: 118,
    specialties: ["ESG Integration", "Performance Metrics", "Progress Reporting"],
    costRange: "€€€",
    location: "Germany, Switzerland, Austria",
    completedProjects: 87
  }
];

export default function DeliveryProviders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter providers based on search term and active tab
  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    
    // Filter by specialties for other tabs
    switch(activeTab) {
      case "carbon":
        return matchesSearch && provider.specialties.some(s => 
          s.toLowerCase().includes("carbon") || 
          s.toLowerCase().includes("climate") ||
          s.toLowerCase().includes("emission"));
      case "reporting":
        return matchesSearch && provider.specialties.some(s => 
          s.toLowerCase().includes("reporting") || 
          s.toLowerCase().includes("compliance"));
      case "strategy":
        return matchesSearch && provider.specialties.some(s => 
          s.toLowerCase().includes("strategy") || 
          s.toLowerCase().includes("planning"));
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/assessment/action-plan" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Action Plan
        </Link>
        <h1 className="text-3xl font-bold mb-2">Delivery Providers Marketplace</h1>
        <p className="text-gray-600">
          Connect with trusted partners to implement your ESG action plan
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, specialty, or keyword..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Providers</TabsTrigger>
          <TabsTrigger value="carbon">Carbon & Climate</TabsTrigger>
          <TabsTrigger value="reporting">Reporting & Compliance</TabsTrigger>
          <TabsTrigger value="strategy">Strategy & Planning</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.length > 0 ? (
          filteredProviders.map(provider => (
            <ProviderCard key={provider.id} provider={provider} />
          ))
        ) : (
          <div className="col-span-3 py-12 text-center">
            <h3 className="text-lg font-medium mb-2">No providers match your search</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ProviderProps {
  provider: {
    id: number;
    name: string;
    logo: string;
    description: string;
    rating: number;
    reviews: number;
    specialties: string[];
    costRange: string;
    location: string;
    completedProjects: number;
  };
}

function ProviderCard({ provider }: ProviderProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center p-6 border-b border-gray-200">
        <div className="w-16 h-16 rounded-md overflow-hidden mr-4 flex-shrink-0">
          <img src={provider.logo} alt={provider.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{provider.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className="text-yellow-500">★</span>
            <span>{provider.rating}</span>
            <span>({provider.reviews} reviews)</span>
            <span className="mx-1">•</span>
            <span>{provider.completedProjects} projects</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <p className="text-gray-700 mb-4">{provider.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {provider.specialties.map(specialty => (
            <Badge key={specialty} variant="outline" className="bg-primary/10">
              {specialty}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
          <div>
            <span className="font-medium">Price:</span> {provider.costRange}
          </div>
          <div>
            <span className="font-medium">Location:</span> {provider.location}
          </div>
        </div>
        
        <div className="flex justify-between gap-2">
          <Button variant="outline" className="w-1/2">View Profile</Button>
          <Button className="w-1/2">Contact</Button>
        </div>
      </div>
    </Card>
  );
}
