
import React from 'react';
import { Navigation } from "@/components/Navigation";

export function Certificates() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 page-header-spacing">
        <h1 className="text-3xl font-bold mb-4">Certificates</h1>
        <p>View and manage your earned certificates</p>
      </div>
    </div>
  );
}
