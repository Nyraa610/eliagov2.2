
import React, { forwardRef } from 'react';
import { MaterialityChart } from './MaterialityChart';
import { CategoryLegend } from './CategoryLegend';
import { MaterialityIssue } from '../formSchema';

interface MatrixContainerProps {
  issues: MaterialityIssue[];
}

export const MatrixContainer = forwardRef<HTMLDivElement, MatrixContainerProps>(
  ({ issues }, ref) => {
    return (
      <div 
        ref={ref}
        className="border rounded-md p-4 bg-white"
      >
        <h3 className="text-center font-semibold text-lg mb-4">Double Materiality Assessment Matrix</h3>
        <MaterialityChart issues={issues} />
        <CategoryLegend />
        <div className="text-sm text-muted-foreground mt-2">
          <p>Bubble size represents issue maturity/readiness</p>
        </div>
      </div>
    );
  }
);

MatrixContainer.displayName = 'MatrixContainer';
