
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import "@xyflow/react/dist/style.css";
import { Share2 } from "lucide-react";
import { useStakeholderMap } from "./hooks/useStakeholderMap";
import { StakeholderAddDialog } from "./visual-map/StakeholderAddDialog";
import { MapToolbar } from "./visual-map/MapToolbar";
import { StakeholderFlowMap } from "./visual-map/StakeholderFlowMap";

type StakeholderVisualMapProps = {
  onComplete: () => void;
};

export function StakeholderVisualMap({ onComplete }: StakeholderVisualMapProps) {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    isLoading,
    isSubmitting,
    selectedNodeId,
    handleNodeClick,
    handlePaneClick,
    handleAddStakeholder,
    handleSaveMap,
    handleSaveVersion
  } = useStakeholderMap();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const reactFlowRef = useRef<HTMLDivElement>(null);

  const handleSaveAndContinue = async () => {
    const success = await handleSaveMap();
    if (success) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" /> Stakeholder Visual Map
          </CardTitle>
          <CardDescription>
            Create a visual map of your stakeholders and their relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapToolbar 
            onAddStakeholder={() => setIsAddDialogOpen(true)}
            onSave={handleSaveAndContinue}
            onSaveVersion={handleSaveVersion}
            reactFlowRef={reactFlowRef}
            isSubmitting={isSubmitting}
          />

          <div className="border rounded-lg h-[600px] bg-gray-50">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <p>Loading stakeholder map...</p>
              </div>
            ) : (
              <StakeholderFlowMap 
                reactFlowRef={reactFlowRef}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                selectedNodeId={selectedNodeId}
                setNodes={setNodes}
                setEdges={setEdges}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <StakeholderAddDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddStakeholder}
      />
    </div>
  );
}
