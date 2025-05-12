
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectorProfilesManager } from "@/components/admin/sector-profiles/SectorProfilesManager";
import { PeerSnapshotsManager } from "@/components/admin/sector-profiles/PeerSnapshotsManager";

export function LaunchpadTabContent() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">ESG Launchpad Manager</h2>
        <p className="text-muted-foreground">
          Manage ESG Launchpad content including sector profiles and peer snapshots
        </p>
      </div>

      <Tabs defaultValue="profiles">
        <TabsList>
          <TabsTrigger value="profiles">Sector Profiles</TabsTrigger>
          <TabsTrigger value="snapshots">Peer Snapshots</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles" className="pt-4">
          <SectorProfilesManager />
        </TabsContent>
        <TabsContent value="snapshots" className="pt-4">
          <PeerSnapshotsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
