
import { Panel } from "@xyflow/react";

export function FlowLegend() {
  return (
    <Panel position="top-left" className="bg-white p-2 rounded shadow-sm text-sm">
      <div className="flex gap-2 items-center">
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
          <span>Primary</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
          <span>Support</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          <span>External</span>
        </div>
        <div className="flex gap-1 items-center">
          <div className="w-3 h-3 bg-purple-400 rounded-sm"></div>
          <span>Custom</span>
        </div>
      </div>
    </Panel>
  );
}
