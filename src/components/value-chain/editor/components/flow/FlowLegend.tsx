
import { Panel } from "@xyflow/react";
import { COLOR_PRESETS } from "@/components/value-chain/node-edit/ColorPicker";

export function FlowLegend() {
  return (
    <Panel position="top-left" className="bg-white p-2 rounded shadow-sm text-sm">
      <div className="flex flex-col gap-1">
        <div className="flex gap-4">
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
        <div className="flex gap-1 items-center border-t pt-1 mt-1">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-300 via-green-300 to-orange-300 rounded-sm"></div>
          <span>Custom Color</span>
          <span className="text-xs text-gray-500 ml-1">(Edit node to customize)</span>
        </div>
      </div>
    </Panel>
  );
}
