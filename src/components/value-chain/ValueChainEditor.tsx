import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Node,
  Edge,
  ConnectionLineType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import FloatingEdge from './FloatingEdge';
import DashedEdge from './DashedEdge';
import WeightedEdge from './WeightedEdge';
import BidirectionalEdge from './BidirectionalEdge';
import { CustomNode } from './CustomNode';
import { SupportActivityNode } from './SupportActivityNode';
import { ExternalFactorNode } from './ExternalFactorNode';
import { MetricNode } from './MetricNode';
import { MilestoneNode } from './MilestoneNode';
import { ResourceNode } from './ResourceNode';
import { CustomToolbar } from './CustomToolbar';
import { useValueChainNodes } from './useValueChainNodes';
import { 
  ValueChainData, 
  NodeType, 
  AIGenerationPrompt, 
  NodeData, 
  ValueChainVersion,
  TemplateType,
  AnalysisResult,
  ThemeType,
  ViewMode,
  ExportFormat,
  OptimizationGoal
} from '@/types/valueChain';
import { EditorContent } from './components/EditorContent';
import { TemplateGallery } from './components/TemplateGallery';
import { VersionHistory } from './components/VersionHistory';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CollaborationPanel } from './components/CollaborationPanel';
import { EnhancedExportPanel } from './components/EnhancedExportPanel';
import { AutomatedValueChainBuilder } from '../AutomatedValueChainBuilder';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import { useAutomatedValueChain } from './hooks/useAutomatedValueChain';
import { useValueChainActions } from './useValueChainActions';
import { useValueChainAnalytics } from './hooks/useValueChainAnalytics';
import { useValueChainVersioning } from './hooks/useValueChainVersioning';
import { useValueChainTemplates } from './hooks/useValueChainTemplates';
import { useValueChainCollaboration } from './hooks/useValueChainCollaboration';
import { useValueChainExport } from './hooks/useValueChainExport';
import { Company } from '@/services/company/types';
import { toast } from 'sonner';
import { valueChainService } from '@/services/value-chain';
import { CollaborationClient } from '@/services/collaboration';
import { User } from '@/types/user';

// Enhanced node types with additional specialized nodes
const nodeTypes = {
  custom: CustomNode,
  valueChainNode: CustomNode,
  support: SupportActivityNode,
  external: ExternalFactorNode,
  metric: MetricNode,
  milestone: MilestoneNode,
  resource: ResourceNode
};

// Enhanced edge types with various connection styles
const edgeTypes = {
  floating: FloatingEdge,
  dashed: DashedEdge,
  weighted: WeightedEdge,
  bidirectional: BidirectionalEdge,
};

// Auto-save debounce delay in milliseconds
const AUTO_SAVE_DELAY = 10000; // 10 seconds

// Available themes for the editor
const AVAILABLE_THEMES: ThemeType[] = ['light', 'dark', 'corporate', 'creative'];

// Available view modes
const VIEW_MODES: ViewMode[] = ['edit', 'presentation', 'compact'];

// Grid configuration
const GRID_CONFIG = {
  snapToGrid: true,
  gridSize: 15,
};

interface ValueChainEditorContainerProps {
  initialData?: ValueChainData | null;
  onDataChange?: (data: ValueChainData) => void;
  autoSave?: boolean;
  company?: Company | null;
  currentUser?: User | null;
  collaborationEnabled?: boolean;
}

const ValueChainEditorContainer = ({ 
  initialData, 
  onDataChange, 
  autoSave = false,
  company: propCompany,
  currentUser,
  collaborationEnabled = false
}: ValueChainEditorContainerProps) => {
  const { company: contextCompany } = useCompanyProfile();
  const company = propCompany || contextCompany;
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.edges || []);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isAutomatedBuilderOpen, setIsAutomatedBuilderOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [theme, setTheme] = useState<ThemeType>('light');
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isAnalyticsDashboardOpen, setIsAnalyticsDashboardOpen] = useState(false);
  const [isExportPanelOpen, setIsExportPanelOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<ValueChainVersion[]>([]);
  const [versionComment, setVersionComment] = useState('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [collaborationClient, setCollaborationClient] = useState<CollaborationClient | null>(null);
  const [activeCollaborators, setActiveCollaborators] = useState<User[]>([]);
  
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string | null>(null);
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({
      ...params,
      type: 'floating',
      animated: false,
    }, eds)),
    [setEdges]
  );

  // Create current value chain data
  const getCurrentValueChainData = useCallback((): ValueChainData => {
    return {
      nodes: nodes as unknown as any[],
      edges,
      name: company?.name ? `${company.name} Value Chain` : "Value Chain",
      companyId: company?.id,
      metadata: {
        ...(initialData?.metadata || {}),
        lastModified: new Date().toISOString(),
        theme,
        viewMode,
      }
    };
  }, [nodes, edges, company, initialData, theme, viewMode]);

  // Enhanced automated value chain generation
  const { handleAutomatedValueChain } = useAutomatedValueChain({
    setIsGenerating,
    setGeneratingProgress,
    setNodes,
    setEdges,
    setSelectedNode,
    setIsAIDialogOpen: setIsAutomatedBuilderOpen,
    company,
    enhancedGeneration: true, // Enable enhanced generation
    nodes, // Pass current nodes for context
    edges, // Pass current edges for context
  });

  // Analytics functionality
  const { 
    analyzeValueChain,
    findBottlenecks,
    calculateChainEfficiency,
    findOptimizationOpportunities,
    generateAnalysisSummary
  } = useValueChainAnalytics({
    nodes,
    edges,
    company
  });

  // Versioning system
  const {
    saveVersion,
    restoreVersion,
    compareVersions,
    getVersionHistory,
  } = useValueChainVersioning({
    nodes,
    edges,
    setNodes,
    setEdges,
    versionHistory,
    setVersionHistory,
    currentUser
  });

  // Template system
  const {
    loadTemplateValueChain,
    getAvailableTemplates,
    saveAsTemplate
  } = useValueChainTemplates({
    setNodes,
    setEdges,
    company
  });

  // Collaboration system
  useEffect(() => {
    if (collaborationEnabled && company?.id && currentUser) {
      const setupRealtimeCollaboration = () => {
        const client = new CollaborationClient({
          documentId: `value-chain-${company.id}`,
          user: {
            id: currentUser.id,
            name: currentUser.name,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
          }
        });
        
        client.onNodesChange((remoteNodes) => {
          setNodes(prev => {
            // Merge remote nodes with local nodes
            const localNodeIds = new Set(prev.map(n => n.id));
            const newNodes = remoteNodes.filter(n => !localNodeIds.has(n.id));
            const updatedNodes = prev.map(localNode => {
              const remoteNode = remoteNodes.find(n => n.id === localNode.id);
              return remoteNode || localNode;
            });
            return [...updatedNodes, ...newNodes];
          });
        });
        
        client.onEdgesChange((remoteEdges) => {
          setEdges(prev => {
            // Merge remote edges with local edges
            const localEdgeIds = new Set(prev.map(e => e.id));
            const newEdges = remoteEdges.filter(e => !localEdgeIds.has(e.id));
            const updatedEdges = prev.map(localEdge => {
              const remoteEdge = remoteEdges.find(e => e.id === localEdge.id);
              return remoteEdge || localEdge;
            });
            return [...updatedEdges, ...newEdges];
          });
        });

        client.onCollaboratorsChange((collaborators) => {
          setActiveCollaborators(collaborators);
        });
        
        setCollaborationClient(client);
        return client;
      };

      const client = setupRealtimeCollaboration();
      
      return () => {
        client.disconnect();
      };
    }
  }, [collaborationEnabled, company?.id, currentUser, setNodes, setEdges]);

  // Enhanced export functionality
  const { 
    exportToFormat,
    exportToMiro,
    exportToFigma,
    exportToExcel,
    getAvailableExportFormats
  } = useValueChainExport({
    nodes,
    edges,
    company
  });

  // Trigger auto-save
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (!company?.id || nodes.length === 0) return;

      try {
        const currentData = getCurrentValueChainData();
        const currentDataString = JSON.stringify(currentData);

        // Skip if data hasn't changed since last save
        if (lastSavedDataRef.current === currentDataString) {
          return;
        }

        const success = await valueChainService.saveValueChain(currentData);
        if (success) {
          console.log("Auto-saved value chain");
          lastSavedDataRef.current = currentDataString;
        }
      } catch (error) {
        console.error("Error auto-saving value chain:", error);
      }
    }, AUTO_SAVE_DELAY);
  }, [company, nodes, getCurrentValueChainData]);

  // Auto-save when nodes or edges change
  useEffect(() => {
    if (autoSave && company?.id && nodes.length > 0) {
      triggerAutoSave();
    }

    // Update parent component if needed
    if (onDataChange) {
      onDataChange(getCurrentValueChainData());
    }

    // Notify collaboration client of changes
    if (collaborationClient) {
      collaborationClient.broadcastNodesChange(nodes);
      collaborationClient.broadcastEdgesChange(edges);
    }

    // Cleanup on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [nodes, edges, autoSave, company, onDataChange, getCurrentValueChainData, triggerAutoSave, collaborationClient]);

  // Enhanced actions with new functionality
  const {
    handleSave,
    handleExport,
    handleImport,
    handleClear,
    handleZoomIn,
    handleZoomOut,
    handleReset
  } = useValueChainActions({
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNode,
    company,
    onSaveSuccess: (savedData) => {
      lastSavedDataRef.current = JSON.stringify(savedData);
      toast.success("Value chain saved successfully");
      // Save a version automatically on manual save
      saveVersion();
    }
  });

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const handleAddNode = useCallback((type: NodeType) => {
    if (!reactFlowWrapper.current) return;

    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: reactFlowBounds.width / 2,
      y: reactFlowBounds.height / 2,
    });
    
    // Determine the correct node type component to use
    const nodeTypeMap = {
      'primary': 'valueChainNode',
      'support': 'support',
      'external': 'external',
      'metric': 'metric',
      'milestone': 'milestone',
      'resource': 'resource'
    };
    
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeTypeMap[type] || 'valueChainNode',
      position,
      data: { 
        label: `${type} Node`, 
        type: type,
        description: 'Click to edit',
        metrics: [],
        priority: 'medium',
        status: 'active'
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  }, [reactFlowInstance, setNodes]);

  const handleUpdateNode = useCallback((nodeId, data) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleChangeTheme = useCallback((newTheme: ThemeType) => {
    setTheme(newTheme);
  }, []);

  const handleChangeViewMode = useCallback((newMode: ViewMode) => {
    setViewMode(newMode);
  }, []);

  const handleRunAnalysis = useCallback(() => {
    const results = analyzeValueChain();
    setAnalysisResults(results);
    setIsAnalyticsDashboardOpen(true);
  }, [analyzeValueChain]);

  // Fit view when nodes change
  useEffect(() => {
    if (nodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.fitView();
      }, 50);
    }
  }, [nodes, reactFlowInstance]);

  // Load initial theme and view mode from metadata if available
  useEffect(() => {
    if (initialData?.metadata?.theme) {
      setTheme(initialData.metadata.theme);
    }
    if (initialData?.metadata?.viewMode) {
      setViewMode(initialData.metadata.viewMode);
    }
  }, [initialData]);

  // Load version history on mount
  useEffect(() => {
    if (company?.id) {
      const history = getVersionHistory();
      setVersionHistory(history);
    }
  }, [company, getVersionHistory]);

  return (
    <div className="w-full h-full">
      <EditorContent
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        selectedNode={selectedNode}
        handleUpdateNode={handleUpdateNode}
        handleAddNode={handleAddNode}
        handleSave={handleSave}
        handleExport={() => setIsExportPanelOpen(true)}
        handleImport={handleImport}
        handleClear={handleClear}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleReset={handleReset}
        isGenerating={isGenerating}
        generatingProgress={generatingProgress}
        onAutomatedBuilder={() => setIsAutomatedBuilderOpen(true)}
        setSelectedNode={setSelectedNode}
        reactFlowWrapper={reactFlowWrapper}
        theme={theme}
        viewMode={viewMode}
        onChangeTheme={handleChangeTheme}
        onChangeViewMode={handleChangeViewMode}
        onOpenTemplates={() => setIsTemplateGalleryOpen(true)}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        onRunAnalysis={handleRunAnalysis}
        gridConfig={GRID_CONFIG}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        activeCollaborators={activeCollaborators}
      />
      
      {/* Enhanced AI Value Chain Builder */}
      <AutomatedValueChainBuilder
        open={isAutomatedBuilderOpen}
        onOpenChange={setIsAutomatedBuilderOpen}
        onGenerate={handleAutomatedValueChain}
        companyName={company?.name || ""}
        industry={company?.industry || ""}
        isGenerating={isGenerating}
        generatingProgress={generatingProgress}
        currentNodes={nodes}
        currentEdges={edges}
        optimizationGoals={['efficiency', 'cost', 'quality', 'innovation', 'sustainability']}
      />
      
      {/* Template Gallery */}
      <TemplateGallery
        open={isTemplateGalleryOpen}
        onOpenChange={setIsTemplateGalleryOpen}
        templates={getAvailableTemplates()}
        onSelectTemplate={loadTemplateValueChain}
        onSaveAsTemplate={() => saveAsTemplate(getCurrentValueChainData())}
        industry={company?.industry || ""}
      />
      
      {/* Version History */}
      <VersionHistory
        open={isVersionHistoryOpen}
        onOpenChange={setIsVersionHistoryOpen}
        versions={versionHistory}
        onRestoreVersion={restoreVersion}
        onCompareVersions={compareVersions}
        currentUser={currentUser}
        versionComment={versionComment}
        setVersionComment={setVersionComment}
        onSaveVersion={() => saveVersion(versionComment)}
      />
      
      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        open={isAnalyticsDashboardOpen}
        onOpenChange={setIsAnalyticsDashboardOpen}
        analysisResults={analysisResults}
        nodes={nodes}
        edges={edges}
        company={company}
      />
      
      {/* Enhanced Export Panel */}
      <EnhancedExportPanel
        open={isExportPanelOpen}
        onOpenChange={setIsExportPanelOpen}
        formats={getAvailableExportFormats()}
        onExport={exportToFormat}
        onExportToMiro={exportToMiro}
        onExportToFigma={exportToFigma}
        onExportToExcel={exportToExcel}
        company={company}
      />
      
      {/* Collaboration Panel (only shown when collaboration is enabled) */}
      {collaborationEnabled && (
        <CollaborationPanel
          activeCollaborators={activeCollaborators}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default ValueChainEditorContainer;
