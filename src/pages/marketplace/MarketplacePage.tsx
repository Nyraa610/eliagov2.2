
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";
import { PartnerCard } from "@/components/marketplace/PartnerCard";
import { ContactPartnerDialog } from "@/components/marketplace/ContactPartnerDialog";
import { MarketplacePartner, marketplaceService } from "@/services/marketplace";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Search, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";

const categoryOptions = [
  { label: "Carbon Management", value: "carbon-management" },
  { label: "ESG Reporting", value: "esg-reporting" },
  { label: "Sustainability Consulting", value: "sustainability-consulting" },
  { label: "Green Energy", value: "green-energy" },
  { label: "Waste Management", value: "waste-management" },
];

const locationOptions = [
  { label: "Europe", value: "europe" },
  { label: "North America", value: "north-america" },
  { label: "Asia Pacific", value: "asia-pacific" },
  { label: "Latin America", value: "latin-america" },
  { label: "Middle East & Africa", value: "middle-east-africa" },
];

const companySizeOptions = [
  { label: "Small (<50 employees)", value: "small" },
  { label: "Medium (50-250 employees)", value: "medium" },
  { label: "Large (>250 employees)", value: "large" },
];

export default function MarketplacePage() {
  const [partners, setPartners] = useState<MarketplacePartner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<MarketplacePartner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<MarketplacePartner | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setIsLoading(true);
        const data = await marketplaceService.getApprovedPartners();
        setPartners(data);
        setFilteredPartners(data);
      } catch (error) {
        console.error("Error fetching partners:", error);
        toast({
          title: "Error",
          description: "Failed to load marketplace partners. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, [toast]);

  useEffect(() => {
    // Filter partners based on search query and selected filters
    const filtered = partners.filter((partner) => {
      // Filter by search query
      const matchesSearch =
        searchQuery.trim() === "" ||
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.services.some((service) =>
          service.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Filter by categories
      const matchesCategories =
        selectedCategories.length === 0 ||
        selectedCategories.some((category) => partner.categories.includes(category));

      // Filter by locations
      const matchesLocations =
        selectedLocations.length === 0 ||
        selectedLocations.some((location) => partner.locations.includes(location));

      // Filter by company sizes
      const matchesCompanySizes =
        selectedCompanySizes.length === 0 ||
        selectedCompanySizes.some((size) => partner.company_sizes.includes(size));

      return matchesSearch && matchesCategories && matchesLocations && matchesCompanySizes;
    });

    setFilteredPartners(filtered);
  }, [searchQuery, selectedCategories, selectedLocations, selectedCompanySizes, partners]);

  const handleContactPartner = (partner: MarketplacePartner) => {
    setSelectedPartner(partner);
    setIsContactDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">ESG Solution Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Find trusted partners to help implement your sustainability initiatives
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/marketplace/apply" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            Become a Partner
          </Link>
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Partners</CardTitle>
          <CardDescription>
            Filter and search for ESG solution providers based on your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="filter">Advanced Filter</TabsTrigger>
            </TabsList>
            <TabsContent value="search">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, service, or description..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </TabsContent>
            <TabsContent value="filter">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Categories</label>
                  <MultiSelect
                    options={categoryOptions}
                    selected={selectedCategories}
                    onChange={setSelectedCategories}
                    placeholder="Select categories..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Locations</label>
                  <MultiSelect
                    options={locationOptions}
                    selected={selectedLocations}
                    onChange={setSelectedLocations}
                    placeholder="Select locations..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Company Size</label>
                  <MultiSelect
                    options={companySizeOptions}
                    selected={selectedCompanySizes}
                    onChange={setSelectedCompanySizes}
                    placeholder="Select company sizes..."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse">
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded mt-auto"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {filteredPartners.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No partners found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedCategories([]);
                setSelectedLocations([]);
                setSelectedCompanySizes([]);
              }}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPartners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  onContact={handleContactPartner}
                />
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-xl font-medium text-blue-800 mb-2">Are you an ESG solution provider?</h3>
        <p className="text-blue-700 mb-6">
          Join our marketplace and connect with businesses looking for sustainability solutions.
          Apply to become a verified partner today.
        </p>
        <Button asChild variant="default">
          <Link to="/marketplace/apply" className="flex items-center gap-2">
            Apply to Join
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <ContactPartnerDialog
        partner={selectedPartner}
        isOpen={isContactDialogOpen}
        onClose={() => {
          setIsContactDialogOpen(false);
          setSelectedPartner(null);
        }}
      />
    </div>
  );
}
