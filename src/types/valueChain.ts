
import { Node, Edge } from '@xyflow/react';

export type NodeData = {
  label: string;
  type?: string;
  description?: string;
  icon?: string;
};

export interface ValueChainNode extends Node<NodeData> {}

export interface ValueChainEdge extends Edge {}

export type ValueChainData = {
  nodes: ValueChainNode[];
  edges: ValueChainEdge[];
  name?: string;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ValueChainTemplate = {
  id: string;
  name: string;
  description: string;
  nodes: ValueChainNode[];
  edges: ValueChainEdge[];
};

export type NodeType = 'primary' | 'support' | 'external' | 'custom';

export type AIGenerationPrompt = {
  companyName: string;
  industry: string;
  products: string[];
  services: string[];
  additionalInfo?: string;
};
