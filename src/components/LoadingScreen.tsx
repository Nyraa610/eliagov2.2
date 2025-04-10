
import React from 'react';
import { Loader2 } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-gray-600">Loading, please wait...</p>
    </div>
  );
}
