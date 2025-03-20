
export const getConnectorName = (key: string): string => {
  switch (key) {
    case "erp": return "ERP System";
    case "crm": return "CRM";
    case "accounting": return "Accounting Software";
    case "ecommerce": return "E-commerce Platform";
    case "hubspot": return "HubSpot";
    default: return key.toUpperCase();
  }
};
