
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
import { FileText, Search, RefreshCw, Download, Calendar, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Company {
  id: string;
  name: string;
}

interface Document {
  id: string;
  name: string;
  document_type: string;
  file_type: string;
  file_size?: number;
  url: string;
  created_at: string;
  company_id: string;
  company_name?: string;
  uploaded_by: string;
  user_email?: string;
}

export function DocumentsTab() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    fetchCompanies();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Get documents with company names
      const { data, error } = await supabase
        .from('company_documents')
        .select(`
          *,
          companies(name),
          profiles:uploaded_by(email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to include company_name
      const formattedData = data.map(doc => ({
        ...doc,
        company_name: doc.companies?.name,
        user_email: doc.profiles?.email
      }));
      
      setDocuments(formattedData);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load documents."
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDocumentType = (type: string): string => {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDocumentTypeColor = (type: string): string => {
    switch (type) {
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'deliverable':
        return 'bg-purple-100 text-purple-800';
      case 'value_chain':
        return 'bg-green-100 text-green-800';
      case 'personal':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = (document: Document) => {
    window.open(document.url, '_blank');
  };

  // Filter documents based on search, company, and type filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.company_name && doc.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.user_email && doc.user_email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCompany = selectedCompany === "all" || doc.company_id === selectedCompany;
    const matchesType = selectedType === "all" || doc.document_type === selectedType;
    
    return matchesSearch && matchesCompany && matchesType;
  });

  // Get unique document types for the filter
  const documentTypes = [...new Set(documents.map(doc => doc.document_type))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
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
              <SelectValue placeholder="Document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {documentTypes.map(type => (
                <SelectItem key={type} value={type}>{formatDocumentType(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={fetchDocuments} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg text-muted-foreground font-medium">No documents found</p>
          <p className="text-sm text-muted-foreground">
            {searchQuery || selectedCompany !== "all" || selectedType !== "all" 
              ? "Try changing your search filters" 
              : "Documents uploaded by clients will appear here"}
          </p>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    {document.name}
                  </TableCell>
                  <TableCell>{document.company_name || "—"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getDocumentTypeColor(document.document_type)}`}>
                      {formatDocumentType(document.document_type)}
                    </span>
                  </TableCell>
                  <TableCell>{formatFileSize(document.file_size)}</TableCell>
                  <TableCell>{document.user_email || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span title={new Date(document.created_at).toLocaleString()}>
                        {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDownload(document)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => window.open(document.url, '_blank')}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
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
