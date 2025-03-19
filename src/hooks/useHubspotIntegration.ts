
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { hubspotService } from "@/services/integrations/hubspotService";
import { HubspotIntegration, HubspotContact, HubspotNote, SustainabilityOpportunity } from "@/services/integrations/types";

export function useHubspotIntegration(companyId: string) {
  const [integration, setIntegration] = useState<HubspotIntegration | null>(null);
  const [contacts, setContacts] = useState<HubspotContact[]>([]);
  const [notes, setNotes] = useState<HubspotNote[]>([]);
  const [opportunities, setOpportunities] = useState<SustainabilityOpportunity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (companyId) {
      loadHubspotData();
    }
  }, [companyId]);

  const loadHubspotData = async () => {
    setLoading(true);
    try {
      const integrationData = await hubspotService.getIntegration(companyId);
      setIntegration(integrationData);

      if (integrationData) {
        // Load contacts and opportunities
        const contactsData = await hubspotService.getContacts(companyId);
        setContacts(contactsData);

        const notesData = await hubspotService.getNotes(companyId);
        setNotes(notesData);

        const opportunitiesData = await hubspotService.getOpportunities(companyId);
        setOpportunities(opportunitiesData);
      }
    } catch (error) {
      console.error("Error loading HubSpot data:", error);
      toast({
        title: "Error",
        description: "Failed to load HubSpot data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncContacts = async () => {
    if (!companyId || !integration) return;

    setSyncing(true);
    try {
      await hubspotService.syncContacts(companyId);
      toast({
        title: "Success",
        description: "Contacts synced successfully",
      });
      // Reload contacts after sync
      const contactsData = await hubspotService.getContacts(companyId);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error syncing contacts:", error);
      toast({
        title: "Error",
        description: "Failed to sync contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const analyzeSustainability = async () => {
    if (!companyId || !integration) return;

    setAnalyzing(true);
    try {
      await hubspotService.analyzeSustainability(companyId);
      toast({
        title: "Success",
        description: "Sustainability analysis completed",
      });
      // Reload data after analysis
      const opportunitiesData = await hubspotService.getOpportunities(companyId);
      setOpportunities(opportunitiesData);
    } catch (error) {
      console.error("Error analyzing sustainability:", error);
      toast({
        title: "Error",
        description: "Failed to analyze sustainability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const connectHubspot = (accessToken: string, refreshToken: string, expiresAt: Date) => {
    if (!companyId) return;

    return hubspotService.saveIntegration(companyId, accessToken, refreshToken, expiresAt)
      .then((result) => {
        if (result) {
          setIntegration(result);
          toast({
            title: "Success",
            description: "HubSpot connected successfully",
          });
          return true;
        }
        return false;
      })
      .catch((error) => {
        console.error("Error connecting HubSpot:", error);
        toast({
          title: "Error",
          description: "Failed to connect HubSpot. Please try again.",
          variant: "destructive",
        });
        return false;
      });
  };

  return {
    integration,
    contacts,
    notes,
    opportunities,
    loading,
    syncing,
    analyzing,
    syncContacts,
    analyzeSustainability,
    connectHubspot,
    refreshData: loadHubspotData
  };
}
