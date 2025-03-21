import { Node, Edge } from "@xyflow/react";

export type NodeType = 'primary' | 'support' | 'external';

export interface ValueChainNode extends Node {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: { label: string; type: NodeType };
}

export interface AIGenerationPrompt {
  companyName: string;
  industry: string;
  products: string[];
  services: string[];
  additionalInfo: string;
}

export interface AIProcessingResponse {
  nodes: ValueChainNode[];
  edges: Edge[];
  metadata: {
    plantUml?: string;
    generatedFor?: string;
    generationTimestamp?: string;
  };
}

export interface ValueChainData {
  nodes: ValueChainNode[];
  edges: Edge[];
  name?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
  version?: number;
  id?: string;
}

export interface ValueChainVersion {
  id: string;
  name: string;
  version: number;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}
