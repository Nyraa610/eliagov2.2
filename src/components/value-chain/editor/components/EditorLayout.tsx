
import { ReactNode } from "react";
import { ReactFlowProvider } from "@xyflow/react";

interface EditorLayoutProps {
  flowRef: React.RefObject<HTMLDivElement>;
  flowCanvas: ReactNode;
  sidePanel?: ReactNode;
}

export function EditorLayout({ flowRef, flowCanvas, sidePanel }: EditorLayoutProps) {
  return (
    <div className="flex gap-4 h-full">
      <div ref={flowRef} className="flex-1 border rounded-lg overflow-hidden h-[680px]">
        <ReactFlowProvider>
          {flowCanvas}
        </ReactFlowProvider>
      </div>
      
      {sidePanel && (
        <div className="w-80">
          {sidePanel}
        </div>
      )}
    </div>
  );
}
