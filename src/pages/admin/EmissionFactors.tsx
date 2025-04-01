
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmissionFactorsImport } from "@/components/admin/EmissionFactorsImport";
import { EmissionFactorsHeader } from "@/components/admin/emission-factors/EmissionFactorsHeader";
import { FilterControls } from "@/components/admin/emission-factors/FilterControls";
import { EmissionFactorsTable } from "@/components/admin/emission-factors/EmissionFactorsTable";
import { useEmissionFactors } from "@/components/admin/emission-factors/useEmissionFactors";

export default function EmissionFactors() {
  const {
    emissionFactors,
    isLoading,
    searchTerm,
    count,
    categoryFilter,
    categories,
    handleSearch,
    handleCategoryChange,
    handleRefresh,
    handleClearFilters
  } = useEmissionFactors();

  return (
    <AdminLayout 
      title="Emission Factors" 
      description="Manage ADEME Base Carbone emission factors for carbon evaluations"
    >
      <div className="space-y-6">
        <EmissionFactorsImport />
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <EmissionFactorsHeader 
              count={count} 
              searchTerm={searchTerm}
              isLoading={isLoading}
              handleSearch={handleSearch}
              handleRefresh={handleRefresh}
              emissionFactors={emissionFactors}
            />
            
            <FilterControls 
              categoryFilter={categoryFilter}
              categories={categories}
              searchTerm={searchTerm}
              handleCategoryChange={handleCategoryChange}
              handleClearFilters={handleClearFilters}
            />
          </div>
          
          <EmissionFactorsTable 
            emissionFactors={emissionFactors}
            isLoading={isLoading}
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            count={count}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
