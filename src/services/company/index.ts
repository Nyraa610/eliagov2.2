
import { companyBaseService } from "./companyBaseService";
import { userCompanyService } from "./userCompanyService";
export { type Company, type CompanyWithRole } from "./types";

// Combine the services into a single export
export const companyService = {
  // Methods from companyBaseService
  getCompanies: companyBaseService.getCompanies,
  getCompany: companyBaseService.getCompany,
  updateCompany: companyBaseService.updateCompany,
  deleteCompany: companyBaseService.deleteCompany,
  
  // Methods from userCompanyService
  getUserCompanies: userCompanyService.getUserCompanies,
  
  // Special case - use userCompanyService.createUserCompany for creating a company
  // This ensures the user is added as an admin
  createCompany: userCompanyService.createUserCompany
};
