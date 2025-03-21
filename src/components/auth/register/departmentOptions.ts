
// Department options
export const departments = [
  { value: "legal", label: "Legal" },
  { value: "operations", label: "Operations" },
  { value: "csr", label: "CSR/Sustainability" },
  { value: "product", label: "Product" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
  { value: "marketing", label: "Marketing" },
  { value: "executive", label: "Executive Leadership" },
];

// Role personas based on department
export const getPersonaOptions = (department: string) => {
  switch (department) {
    case "legal":
      return [
        { value: "general_counsel", label: "General Counsel" },
        { value: "legal_specialist", label: "Legal Specialist" },
        { value: "compliance_officer", label: "Compliance Officer" },
      ];
    case "operations":
      return [
        { value: "operations_director", label: "Operations Director" },
        { value: "supply_chain_manager", label: "Supply Chain Manager" },
        { value: "logistics_manager", label: "Logistics Manager" },
      ];
    case "csr":
      return [
        { value: "csr_director", label: "CSR/ESG Director" },
        { value: "sustainability_manager", label: "Sustainability Manager" },
        { value: "esg_specialist", label: "ESG Specialist" },
      ];
    case "product":
      return [
        { value: "product_manager", label: "Product Manager" },
        { value: "r_and_d_director", label: "R&D Director" },
        { value: "innovation_manager", label: "Innovation Manager" },
      ];
    case "finance":
      return [
        { value: "cfo", label: "CFO" },
        { value: "finance_director", label: "Finance Director" },
        { value: "controller", label: "Controller" },
      ];
    case "hr":
      return [
        { value: "hr_director", label: "HR Director" },
        { value: "talent_acquisition", label: "Talent Acquisition Manager" },
        { value: "learning_development", label: "Learning & Development Manager" },
      ];
    case "marketing":
      return [
        { value: "marketing_director", label: "Marketing Director" },
        { value: "brand_manager", label: "Brand Manager" },
        { value: "communications_manager", label: "Communications Manager" },
      ];
    case "executive":
      return [
        { value: "ceo", label: "CEO" },
        { value: "coo", label: "COO" },
        { value: "owner", label: "Owner" },
      ];
    default:
      return [
        { value: "manager", label: "Manager" },
        { value: "specialist", label: "Specialist" },
        { value: "other", label: "Other" },
      ];
  }
};
