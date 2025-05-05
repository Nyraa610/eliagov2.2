
import React from "react";
import { getCategoryColor } from "./MaterialityChart";

export function CategoryLegend() {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{backgroundColor: getCategoryColor('Environmental')}}></div>
        <span>Environmental</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{backgroundColor: getCategoryColor('Social')}}></div>
        <span>Social</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{backgroundColor: getCategoryColor('Governance')}}></div>
        <span>Governance</span>
      </div>
    </div>
  );
}
