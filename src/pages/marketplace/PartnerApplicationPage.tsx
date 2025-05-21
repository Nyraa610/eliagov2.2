
import React from "react";
import { PartnerApplicationForm } from "@/components/marketplace/PartnerApplicationForm";

export default function PartnerApplicationPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Solution Provider Application</h1>
      <PartnerApplicationForm />
    </div>
  );
}
