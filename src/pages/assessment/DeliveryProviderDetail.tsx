
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Globe, MapPin, Users, Calendar, CheckCircle, BarChart4 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Sample provider data - in a real app this would come from an API with detailed information
const providersData = {
  "1": {
    id: 1,
    name: "EcoSolutions Ltd",
    logo: "https://placehold.co/100x100?text=ES",
    description: "Specializing in carbon footprint reduction and renewable energy solutions for mid-sized to large enterprises. Our team of experts has over 15 years of experience in helping companies achieve their sustainability goals.",
    rating: 4.8,
    reviews: 124,
    specialties: ["Carbon Reduction", "Renewable Energy", "Sustainability Reporting"],
    costRange: "€€€",
    location: "France, Germany, Spain",
    completedProjects: 78,
    email: "contact@ecosolutions.com",
    phone: "+33 1 23 45 67 89",
    website: "www.ecosolutions.com",
    address: "15 Rue de la Paix, 75002 Paris, France",
    foundedYear: 2008,
    teamSize: "50-100",
    certifications: ["ISO 14001", "GRI Certified", "CDP Accredited Provider"],
    casestudies: [
      {
        title: "Carbon Reduction for RetailCorp",
        description: "Reduced carbon emissions by 35% over 3 years through comprehensive energy auditing and renewable energy transition.",
        results: ["35% carbon reduction", "€2.5M annual energy savings", "Improved ESG rating by 2 levels"]
      },
      {
        title: "Sustainable Supply Chain for ManufactCo",
        description: "Implemented sustainable procurement policies and supplier evaluation framework across global operations.",
        results: ["80% of suppliers now meeting ESG criteria", "Reduced scope 3 emissions by 22%", "Improved supply chain resilience"]
      },
      {
        title: "ESG Reporting Excellence for FinGroup",
        description: "Developed comprehensive ESG reporting framework aligned with TCFD and EU taxonomy requirements.",
        results: ["Top-rated ESG report in sector", "100% compliance with reporting requirements", "Enhanced investor relations"]
      }
    ]
  }
};

export default function DeliveryProviderDetail() {
  const { providerId } = useParams<{ providerId: string }>();
  // In a real application, you would fetch the provider data based on the ID
  const provider = providerId ? providersData[providerId] : null;

  if (!provider) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Provider Not Found</h1>
        <p className="mb-6">The provider you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/assessment/action-plan/providers">Back to Providers</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/assessment/action-plan/providers" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Providers
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Provider info */}
        <div className="lg:col-span-2">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 rounded-md overflow-hidden mr-6 flex-shrink-0">
              <img src={provider.logo} alt={provider.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{provider.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-500 flex items-center">
                  ★ <span className="text-gray-800 ml-1">{provider.rating}</span>
                </span>
                <span className="text-gray-600">({provider.reviews} reviews)</span>
                <span className="mx-1 text-gray-400">•</span>
                <span className="text-gray-600">{provider.completedProjects} completed projects</span>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="mb-12">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Case Studies</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-gray-700">{provider.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.specialties.map(specialty => (
                    <Badge key={specialty} variant="outline" className="bg-primary/10 text-sm py-1">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.certifications.map(cert => (
                    <div key={cert} className="flex items-center gap-1.5 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                      <CheckCircle className="h-4 w-4" />
                      {cert}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Case Studies</h2>
              {provider.casestudies.map((casestudy, index) => (
                <Card key={index} className="mb-4">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">{casestudy.title}</h3>
                    <p className="text-gray-700 mb-4">{casestudy.description}</p>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <BarChart4 className="h-4 w-4 mr-1" /> Key Results
                      </h4>
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {casestudy.results.map((result, idx) => (
                          <li key={idx}>{result}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="reviews">
              <div className="text-center py-10">
                <h2 className="text-xl font-semibold mb-2">Reviews Coming Soon</h2>
                <p className="text-gray-600">Client reviews for this provider will be available shortly.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Contact info and actions */}
        <div>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <span>{provider.email}</span>
                </li>
                <li className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <span>{provider.phone}</span>
                </li>
                <li className="flex items-start">
                  <Globe className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <span>{provider.website}</span>
                </li>
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                  <span>{provider.address}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4">Company Details</h2>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Founded</span>
                  </div>
                  <span className="font-medium">{provider.foundedYear}</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Team Size</span>
                  </div>
                  <span className="font-medium">{provider.teamSize}</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Service Areas</span>
                  </div>
                  <span className="font-medium">{provider.location}</span>
                </li>
                <li className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart4 className="h-5 w-5 mr-2 text-gray-500" />
                    <span>Price Range</span>
                  </div>
                  <span className="font-medium">{provider.costRange}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button className="w-full">Request a Quote</Button>
            <Button variant="outline" className="w-full">Schedule a Call</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
