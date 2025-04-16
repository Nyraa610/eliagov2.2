
import React from 'react';
import { Handle, Position } from '@xyflow/react';

// Company Node Component
const CompanyNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-blue-500 text-white border-2 border-blue-700 min-w-[150px] text-center">
      <div className="font-bold">{data.label}</div>
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Top} />
    </div>
  );
};

// Employee Stakeholder Node
const EmployeeNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-green-500 text-white border-2 border-green-700 min-w-[150px] text-center">
      <div className="font-bold">{data.label}</div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

// Customer Stakeholder Node
const CustomerNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-red-500 text-white border-2 border-red-700 min-w-[150px] text-center">
      <div className="font-bold">{data.label}</div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

// Supplier Stakeholder Node
const SupplierNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-yellow-500 text-white border-2 border-yellow-700 min-w-[150px] text-center">
      <div className="font-bold">{data.label}</div>
      <Handle type="target" position={Position.Right} />
      <Handle type="source" position={Position.Left} />
    </div>
  );
};

// Community Stakeholder Node
const CommunityNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-purple-500 text-white border-2 border-purple-700 min-w-[150px] text-center">
      <div className="font-bold">{data.label}</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// Government Stakeholder Node
const GovernmentNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gray-800 text-white border-2 border-gray-900 min-w-[150px] text-center">
      <div className="font-bold">{data.label}</div>
      <Handle type="target" position={Position.Bottom} />
      <Handle type="source" position={Position.Top} />
    </div>
  );
};

// Generic Stakeholder Node
const GenericNode = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-gray-500 text-white border-2 border-gray-700 min-w-[150px] text-center">
      <div className="font-bold">{data.label}</div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export const StakeholderNodeTypes = {
  companyNode: CompanyNode,
  employeeNode: EmployeeNode,
  customerNode: CustomerNode,
  supplierNode: SupplierNode,
  communityNode: CommunityNode,
  governmentNode: GovernmentNode,
  genericNode: GenericNode,
};
