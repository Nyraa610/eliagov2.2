
import { Node, Edge } from "@xyflow/react";

export type NodeType = 'primary' | 'support' | 'external' | 'custom';

// Make NodeData a Record<string, unknown> to satisfy the Node type requirements
export interface NodeData extends Record<string, unknown> {
  label: string;
  type: NodeType;
  description?: string;
}

// Update ValueChainNode to correctly extend Node
export interface ValueChainNode extends Node<NodeData> {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
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
