
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, RefreshCw, ExternalLink, Calendar, ClipboardCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AssessmentType } from "@/services/assessment"; // Updated import path
import { Link } from "react-router-dom";

interface Company {
  id: string;
  name: string;
}

interface Assessment {
  id: string;
  user_id: string;
  assessment_type: AssessmentType;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
  company_name?: string;
  company_id?: string;
}

export function AssessmentsTab() {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    fetchCompanies();
    fetchAssessments();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      
      // Get assessments
      const { data, error } = await supabase
        .from('assessment_progress')
        .select(`
          id, user_id, assessment_type, status, progress, created_at, updated_at, form_data
        `)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // For each assessment, get the user and company information separately
      const enhancedAssessments: Assessment[] = [];
      
      for (const assessment of data) {
        // Get user information
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('email, full_name, company_id')
          .eq('id', assessment.user_id)
          .single();
        
        if (userError) {
          console.error("Error fetching user data:", userError);
          continue;
        }
        
        // Get company information if company_id exists
        let companyName = undefined;
        if (userData.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('name')
            .eq('id', userData.company_id)
            .single();
          
          if (!companyError && companyData) {
            companyName = companyData.name;
          }
        }
        
        // Add the enhanced assessment to the array
        enhancedAssessments.push({
          ...assessment,
          user_email: userData.email,
          user_name: userData.full_name,
          company_id: userData.company_id,
          company_name: companyName
        });
      }
      
      setAssessments(enhancedAssessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assessments."
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAssessmentType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultsPath = (assessment: Assessment): string => {
    switch (assessment.assessment_type) {
      case 'rse_diagnostic':
        return '/assessment/esg-diagnostic-results';
      case 'carbon_evaluation':
        return '/assessment/carbon-evaluation-results';
      case 'action_plan':
        return '/assessment/action-plan-results';
      case 'value_chain':
        return '/assessment/value-chain-results';
      case 'materiality_analysis':
        return '/assessment/materiality-analysis-results';
      case 'iro_analysis':
        return '/assessment/iro-analysis-results';
      default:
        return '/assessment';
    }
  };

  // Filter assessments based on search, company, and type filters
  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = 
      (assessment.user_email && assessment.user_email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (assessment.user_name && assessment.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (assessment.company_name && assessment.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      assessment.assessment_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCompany = selectedCompany === "all" || assessment.company_id === selectedCompany;
    const matchesType = selectedType === "all" || assessment.assessment_type === selectedType;
    
    return matchesSearch && matchesCompany && matchesType;
  });

  // Get unique assessment types for the filter
  const assessmentTypes = [...new Set(assessments.map(assessment => assessment.assessment_type))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search assessments..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map(company => (
                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Assessment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {assessmentTypes.map(type => (
                <SelectItem key={type} value={type}>{formatAssessmentType(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={fetchAssessments} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg text-muted-foreground font-medium">No assessments found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || selectedCompany !== "all" || selectedType !== "all" 
              ? "Try changing your search filters" 
              : "Assessments completed by clients will appear here"}
          </p>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell className="font-medium">
                    {formatAssessmentType(assessment.assessment_type)}
                  </TableCell>
                  <TableCell>
                    {assessment.user_name || assessment.user_email || "—"}
                  </TableCell>
                  <TableCell>{assessment.company_name || "—"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(assessment.status)}`}>
                      {assessment.status === 'in_progress' ? 'In Progress' : 
                       assessment.status === 'completed' ? 'Completed' : 'Not Started'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-full max-w-[100px]">
                      <Progress value={assessment.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground mt-1">
                        {assessment.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span title={new Date(assessment.updated_at).toLocaleString()}>
                        {formatDistanceToNow(new Date(assessment.updated_at), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {assessment.progress === 100 && (
                      <Button size="sm" variant="outline" asChild>
                        <Link to={getResultsPath(assessment)}>
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Results
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
