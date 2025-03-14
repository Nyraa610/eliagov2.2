
import { useState } from "react";
import { CompanyAnalysisResult } from "@/services/companyAnalysisService";
import { Info, Users, MapPin, CalendarDays, Save, Edit, Check, FileText, Briefcase, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  
  const renderEditableField = (field: keyof CompanyAnalysisResult, label: string, icon: React.ReactNode) => {
    const isEditing = editMode[field];
    const value = editedValues[field] !== undefined ? editedValues[field] : companyInfo[field];
    
    return (
      <div className="flex items-start gap-2">
        <div className="bg-primary/10 p-2 rounded-full mt-1">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">{label}</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => isEditing ? handleSave(field) : toggleEditMode(field)}
              className="h-6 w-6 p-0"
            >
              {isEditing ? <Check className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
            </Button>
          </div>
          {isEditing ? (
            <Input
              value={value as string}
              onChange={(e) => handleChange(field, e.target.value)}
              className="mt-1 text-sm"
            />
          ) : (
            <p className="text-sm text-muted-foreground">{value}</p>
          )}
        </div>
      </div>
    );
  };
  
  const renderEditableTextArea = (field: keyof CompanyAnalysisResult, label: string) => {
    const isEditing = editMode[field];
    const value = editedValues[field] !== undefined ? editedValues[field] : companyInfo[field];
    
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">{label}</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => isEditing ? handleSave(field) : toggleEditMode(field)}
            className="h-6 w-6 p-0"
          >
            {isEditing ? <Check className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
          </Button>
        </div>
        {isEditing ? (
          <Textarea
            value={value as string}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full text-sm"
            rows={4}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{value}</p>
        )}
      </div>
    );
  };
  
  const renderEditableProductServices = () => {
    const field = 'productsServices';
    const isEditing = editMode[field];
    const products = editedValues[field] !== undefined 
      ? editedValues[field] as string[] 
      : companyInfo.productsServices;
    
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium">Products & Services</h4>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => isEditing ? handleSave(field) : toggleEditMode(field)}
            className="h-6 w-6 p-0"
          >
            {isEditing ? <Check className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
          </Button>
        </div>
        {isEditing ? (
          <Textarea
            value={products.join("\n")}
            onChange={(e) => {
              const lines = e.target.value.split("\n").filter(line => line.trim() !== "");
              handleChange(field, lines);
            }}
            placeholder="Enter one product or service per line"
            className="w-full text-sm"
            rows={4}
          />
        ) : (
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {products.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  // Check if we have French registry data
  const hasFrenchRegistryData = !!(companyInfo.siren || companyInfo.siret);
  
  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-lg">Company Overview</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => editMode.overview ? handleSave('overview') : toggleEditMode('overview')}
            className="h-6 w-6 p-0"
          >
            {editMode.overview ? <Check className="h-3 w-3" /> : <Edit className="h-3 w-3" />}
          </Button>
        </div>
        {editMode.overview ? (
          <Textarea
            value={editedValues.overview || companyInfo.overview}
            onChange={(e) => handleChange('overview', e.target.value)}
            className="w-full text-sm"
            rows={4}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{editedValues.overview || companyInfo.overview}</p>
        )}
      </div>
      
      {hasFrenchRegistryData && (
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Official French Registry Data
            </h3>
            {companyInfo.registryStatus && (
              <Badge variant={companyInfo.registryStatus === "Active" ? "success" : "destructive"}>
                {companyInfo.registryStatus}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {companyInfo.siren && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">SIREN:</span>
                <span className="text-sm">{companyInfo.siren}</span>
              </div>
            )}
            
            {companyInfo.siret && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">SIRET:</span>
                <span className="text-sm">{companyInfo.siret}</span>
              </div>
            )}
            
            {companyInfo.legalForm && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Legal Form:</span>
                <span className="text-sm">{companyInfo.legalForm}</span>
              </div>
            )}
            
            {companyInfo.activityCode && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Activity Code:</span>
                <span className="text-sm">{companyInfo.activityCode}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderEditableField('industry', 'Industry', <Info className="h-4 w-4 text-primary" />)}
        {renderEditableField('employeeCount', 'Company Size', <Users className="h-4 w-4 text-primary" />)}
        {renderEditableField('location', 'Headquarters', <MapPin className="h-4 w-4 text-primary" />)}
        {renderEditableField('yearFounded', 'Founded', <CalendarDays className="h-4 w-4 text-primary" />)}
      </div>
      
      {renderEditableTextArea('mission', 'Mission')}
      
      {renderEditableProductServices()}
      
      {renderEditableTextArea('history', 'History')}
    </div>
  );
}
