
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketplacePartner, marketplaceService } from "@/services/marketplace";
import { PartnerCard } from "@/components/marketplace/PartnerCard";
import { ContactPartnerDialog } from "@/components/marketplace/ContactPartnerDialog";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { Loader2, Search, Building, FileText, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function MarketplacePage() {
  const [partners, setPartners] = useState<MarketplacePartner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<MarketplacePartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPartner, setSelectedPartner] = useState<MarketplacePartner | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const { company } = useCompanyProfile();
  
  useEffect(() => {
    const loadPartners = async () => {
      try {
        setIsLoading(true);
        const data = await marketplaceService.getApprovedPartners();
        setPartners(data);
        setFilteredPartners(data);
      } catch (error) {
        console.error("Error loading partners:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPartners();
  }, []);
  
  useEffect(() => {
    // Filter partners based on search and category
    let result = [...partners];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (partner) =>
          partner.name.toLowerCase().includes(term) ||
          partner.description?.toLowerCase().includes(term) ||
          partner.services.some((service) => service.toLowerCase().includes(term))
      );
    }
    
    if (selectedCategory !== "all") {
      result = result.filter((partner) => 
        partner.categories.includes(selectedCategory)
      );
    }
    
    setFilteredPartners(result);
  }, [searchTerm, selectedCategory, partners]);
  
  const handleContactPartner = (partner: MarketplacePartner) => {
    setSelectedPartner(partner);
    setIsContactDialogOpen(true);
  };
  
  const allCategories = Array.from(
    new Set(partners.flatMap((partner) => partner.categories))
  ).sort();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">ESG Solution Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Find verified partners to help with your sustainability journey
          </p>
        </div>
        <Button asChild>
          <Link to="/marketplace/apply">Become a Solution Provider</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search partners..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Categories</label>
                <div className="space-y-1">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => setSelectedCategory("all")}
                    size="sm"
                  >
                    All Categories
                  </Button>
                  {allCategories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => setSelectedCategory(category)}
                      size="sm"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <Building className="w-4 h-4" /> All Partners
              </TabsTrigger>
              <TabsTrigger value="consulting" className="flex items-center gap-1">
                <FileText className="w-4 h-4" /> Consulting
              </TabsTrigger>
              <TabsTrigger value="solutions" className="flex items-center gap-1">
                <Zap className="w-4 h-4" /> Solutions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredPartners.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No partners found matching your criteria.
                    </p>
                    <Button variant="outline" onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}>
                      Reset Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPartners.map((partner) => (
                    <PartnerCard
                      key={partner.id}
                      partner={partner}
                      onContact={handleContactPartner}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="consulting" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPartners
                    .filter(partner => 
                      partner.categories.some(cat => 
                        ["ESG Consulting", "Sustainability Reporting"].includes(cat)
                      )
                    )
                    .map((partner) => (
                      <PartnerCard
                        key={partner.id}
                        partner={partner}
                        onContact={handleContactPartner}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="solutions" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPartners
                    .filter(partner => 
                      partner.categories.some(cat => 
                        ["Carbon Management", "Green Energy", "Waste Management", "Circular Economy"].includes(cat)
                      )
                    )
                    .map((partner) => (
                      <PartnerCard
                        key={partner.id}
                        partner={partner}
                        onContact={handleContactPartner}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <ContactPartnerDialog
        partner={selectedPartner}
        isOpen={isContactDialogOpen}
        onClose={() => {
          setIsContactDialogOpen(false);
          setSelectedPartner(null);
        }}
        companyId={company?.id}
      />
    </div>
  );
}
