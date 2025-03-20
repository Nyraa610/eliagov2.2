import { useState } from "react";
import { useParams } from "react-router-dom";
import { UserLayout } from "@/components/user/UserLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Users, MessageSquare, Sparkles } from "lucide-react";
import { useHubspotIntegration } from "@/hooks/useHubspotIntegration";
import { HubspotContact, HubspotNote, SustainabilityOpportunity } from "@/services/integrations/types";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HubspotConnector } from "@/components/company/settings/connectors/HubspotConnector";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function SalesOpportunities() {
  const { id } = useParams<{ id: string }>();
  const { company, loading: companyLoading } = useCompanyProfile(id);
  const [activeTab, setActiveTab] = useState("overview");
  
  const { 
    integration, 
    contacts, 
    notes, 
    opportunities, 
    loading, 
    syncing, 
    analyzing,
    syncContacts,
    analyzeSustainability,
    refreshData
  } = useHubspotIntegration(id || "");

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return "??";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`;
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (companyLoading || loading) {
    return (
      <UserLayout title="Sales Opportunities">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Loading sales opportunities data...</p>
          </div>
        </div>
      </UserLayout>
    );
  }

  if (!company) {
    return (
      <UserLayout title="Sales Opportunities">
        <div className="flex justify-center items-center h-64">
          <p>Company not found</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <ProtectedRoute>
      <UserLayout title={`Sales Opportunities - ${company.name}`}>
        <div className="container py-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Sales Opportunities</h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {!integration ? (
            <div className="max-w-3xl mx-auto">
              <HubspotConnector companyId={company.id} />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="overview">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Opportunities
                </TabsTrigger>
                <TabsTrigger value="contacts">
                  <Users className="h-4 w-4 mr-2" />
                  Contacts
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Sustainability Opportunities</CardTitle>
                      <CardDescription>
                        Opportunities identified from contact interactions
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={analyzeSustainability} 
                      disabled={analyzing}
                      className="flex items-center gap-2"
                    >
                      {analyzing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {analyzing ? "Analyzing..." : "Analyze Discussions"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {opportunities.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No opportunities found. Click "Analyze Discussions" to identify new opportunities.</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {opportunities.map((opportunity) => (
                          <div key={opportunity.id} className="py-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">{opportunity.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {opportunity.hubspot_contacts ? 
                                    `${opportunity.hubspot_contacts.first_name || ""} ${opportunity.hubspot_contacts.last_name || ""}` : 
                                    "Unknown contact"}
                                </p>
                                <p className="mt-1 text-sm">{opportunity.description}</p>
                              </div>
                              <Badge className={getScoreColor(opportunity.opportunity_score)}>
                                Score: {opportunity.opportunity_score}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contacts" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>HubSpot Contacts</CardTitle>
                      <CardDescription>
                        Contacts with sustainability scores
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={syncContacts} 
                      disabled={syncing}
                      className="flex items-center gap-2"
                    >
                      {syncing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {syncing ? "Syncing..." : "Sync Contacts"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {contacts.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No contacts found. Click "Sync Contacts" to import from HubSpot.</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {contacts.map((contact) => (
                          <div key={contact.id} className="py-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-4">
                                <AvatarFallback>
                                  {getInitials(contact.first_name, contact.last_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {contact.first_name} {contact.last_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {contact.email || "No email"} • {contact.company_name || "No company"}
                                </p>
                              </div>
                            </div>
                            <Badge className={getScoreColor(contact.sustainability_score)}>
                              Score: {contact.sustainability_score}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Notes</CardTitle>
                    <CardDescription>
                      Notes from contacts analyzed for sustainability discussions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {notes.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No notes found. Sync contacts to view notes.</p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {notes.map((note) => (
                          <div key={note.id} className="py-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">
                                  {note.hubspot_contacts?.first_name} {note.hubspot_contacts?.last_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(note.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge className={getScoreColor(note.sustainability_score)}>
                                Score: {note.sustainability_score}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm">{note.content}</p>
                            {note.sustainability_keywords && note.sustainability_keywords.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {note.sustainability_keywords.map((keyword, i) => (
                                  <Badge key={i} variant="outline" className="bg-blue-50">{keyword}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </UserLayout>
    </ProtectedRoute>
  );
}
