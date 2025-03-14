
import { useState } from "react";
import { CompanyAnalysisResult } from "@/services/companyAnalysisService";
import { Info, Users, MapPin, CalendarDays, Building } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  EditableField,
  EditableTextArea,
  EditableProductServices,
  CompanyOverviewSection,
  FrenchRegistryData
} from "./editable-company-info";

interface EditableCompanyInfoDisplayProps {
  companyInfo: CompanyAnalysisResult;
  onSave: (updatedInfo: CompanyAnalysisResult) => void;
}

export function EditableCompanyInfoDisplay({ companyInfo, onSave }: EditableCompanyInfoDisplayProps) {
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [editedValues, setEditedValues] = useState<Partial<CompanyAnalysisResult>>(companyInfo);
  const { toast } = useToast();
  
  const toggleEditMode = (field: keyof CompanyAnalysisResult) => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  const handleSave = (field: keyof CompanyAnalysisResult) => {
    const updatedInfo = { ...companyInfo, ...editedValues };
    onSave(updatedInfo);
    toggleEditMode(field);
    
    toast({
      title: "Saved",
      description: `${field.charAt(0).toUpperCase() + field.slice(1)} has been updated.`,
      duration: 3000,
    });
  };
  
  const handleChange = (field: keyof CompanyAnalysisResult, value: any) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <CompanyOverviewSection
        overview={editedValues.overview || companyInfo.overview}
        isEditing={editMode.overview}
        onToggleEdit={() => toggleEditMode('overview')}
        onSave={() => handleSave('overview')}
        onChange={(value) => handleChange('overview', value)}
      />
      
      <FrenchRegistryData
        registryStatus={companyInfo.registryStatus}
        siren={companyInfo.siren}
        siret={companyInfo.siret}
        legalForm={companyInfo.legalForm}
        activityCode={companyInfo.activityCode}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          field="industry"
          label="Industry"
          icon={<Info className="h-4 w-4 text-primary" />}
          value={editedValues.industry !== undefined ? editedValues.industry : companyInfo.industry}
          isEditing={editMode.industry}
          onToggleEdit={() => toggleEditMode('industry')}
          onSave={() => handleSave('industry')}
          onChange={(value) => handleChange('industry', value)}
        />
        
        <EditableField
          field="employeeCount"
          label="Company Size"
          icon={<Users className="h-4 w-4 text-primary" />}
          value={editedValues.employeeCount !== undefined ? editedValues.employeeCount : companyInfo.employeeCount}
          isEditing={editMode.employeeCount}
          onToggleEdit={() => toggleEditMode('employeeCount')}
          onSave={() => handleSave('employeeCount')}
          onChange={(value) => handleChange('employeeCount', value)}
        />
        
        <EditableField
          field="location"
          label="Headquarters"
          icon={<MapPin className="h-4 w-4 text-primary" />}
          value={editedValues.location !== undefined ? editedValues.location : companyInfo.location}
          isEditing={editMode.location}
          onToggleEdit={() => toggleEditMode('location')}
          onSave={() => handleSave('location')}
          onChange={(value) => handleChange('location', value)}
        />
        
        <EditableField
          field="yearFounded"
          label="Founded"
          icon={<CalendarDays className="h-4 w-4 text-primary" />}
          value={editedValues.yearFounded !== undefined ? editedValues.yearFounded : companyInfo.yearFounded}
          isEditing={editMode.yearFounded}
          onToggleEdit={() => toggleEditMode('yearFounded')}
          onSave={() => handleSave('yearFounded')}
          onChange={(value) => handleChange('yearFounded', value)}
        />
      </div>
      
      <EditableTextArea
        field="mission"
        label="Mission"
        value={editedValues.mission !== undefined ? editedValues.mission : companyInfo.mission}
        isEditing={editMode.mission}
        onToggleEdit={() => toggleEditMode('mission')}
        onSave={() => handleSave('mission')}
        onChange={(value) => handleChange('mission', value)}
      />
      
      <EditableProductServices
        products={editedValues.productsServices !== undefined ? editedValues.productsServices : companyInfo.productsServices}
        isEditing={editMode.productsServices}
        onToggleEdit={() => toggleEditMode('productsServices')}
        onSave={() => handleSave('productsServices')}
        onChange={(products) => handleChange('productsServices', products)}
      />
      
      <EditableTextArea
        field="history"
        label="History"
        value={editedValues.history !== undefined ? editedValues.history : companyInfo.history}
        isEditing={editMode.history}
        onToggleEdit={() => toggleEditMode('history')}
        onSave={() => handleSave('history')}
        onChange={(value) => handleChange('history', value)}
      />
    </div>
  );
}
