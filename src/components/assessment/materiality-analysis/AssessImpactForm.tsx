
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues, issueCategories } from "./formSchema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AssessImpactFormProps {
  form: UseFormReturn<MaterialityFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function AssessImpactForm({ form, onPrevious, onNext }: AssessImpactFormProps) {
  const issues = form.watch("materialIssues") || [];
  const [activeTab, setActiveTab] = useState<string>("table");
  
  const handleFinancialRatingChange = (index: number, value: number[]) => {
    const updatedIssues = [...issues];
    updatedIssues[index] = {
      ...updatedIssues[index],
      financialMateriality: value[0]
    };
    form.setValue("materialIssues", updatedIssues);
  };
  
  const handleImpactRatingChange = (index: number, value: number[]) => {
    const updatedIssues = [...issues];
    updatedIssues[index] = {
      ...updatedIssues[index],
      impactMateriality: value[0]
    };
    form.setValue("materialIssues", updatedIssues);
  };
  
  const handleMaturityRatingChange = (index: number, value: number[]) => {
    const updatedIssues = [...issues];
    updatedIssues[index] = {
      ...updatedIssues[index],
      maturity: value[0]
    };
    form.setValue("materialIssues", updatedIssues);
  };
  
  const getScoreLabelColor = (score: number) => {
    if (score >= 7) return "text-red-600 font-medium";
    if (score >= 4) return "text-amber-600 font-medium";
    return "text-green-600 font-medium";
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {issues.length === 0 ? (
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
            <p className="text-amber-800">No material issues have been identified yet. Please go back and add some issues first.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Assess Material Issues Impact</h3>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="cards">Card View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="bg-muted/30 rounded-md p-4 text-sm">
              <p>Rate each issue on a scale of 1-10 (low to high) based on:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Financial Materiality:</strong> Impact on your company's financial performance</li>
                <li><strong>Impact Materiality:</strong> Your company's impact on society and environment</li>
                <li><strong>Maturity:</strong> How prepared your organization is to address this issue</li>
              </ul>
            </div>
            
            <TabsContent value="table" className="mt-0">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Issue</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="w-[180px] text-center">Financial Materiality</TableHead>
                      <TableHead className="w-[180px] text-center">Impact Materiality</TableHead>
                      <TableHead className="w-[180px] text-center">Maturity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issues.map((issue, index) => (
                      <TableRow key={issue.id || index}>
                        <TableCell className="font-medium">{issue.title}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            issue.category === 'Environmental' ? 'bg-green-100 text-green-800' :
                            issue.category === 'Social' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {issue.category || "Uncategorized"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Slider 
                              value={[issue.financialMateriality]} 
                              min={1} 
                              max={10} 
                              step={1}
                              onValueChange={(value) => handleFinancialRatingChange(index, value)}
                              className="w-[100px]"
                            />
                            <span className={getScoreLabelColor(issue.financialMateriality)}>
                              {issue.financialMateriality}/10
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Slider 
                              value={[issue.impactMateriality]} 
                              min={1} 
                              max={10} 
                              step={1}
                              onValueChange={(value) => handleImpactRatingChange(index, value)}
                              className="w-[100px]"
                            />
                            <span className={getScoreLabelColor(issue.impactMateriality)}>
                              {issue.impactMateriality}/10
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Slider 
                              value={[issue.maturity || 5]} 
                              min={1} 
                              max={10} 
                              step={1}
                              onValueChange={(value) => handleMaturityRatingChange(index, value)}
                              className="w-[100px]"
                            />
                            <span className={getScoreLabelColor(issue.maturity || 5)}>
                              {issue.maturity || 5}/10
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="cards" className="mt-0">
              <div className="grid md:grid-cols-2 gap-4">
                {issues.map((issue, index) => (
                  <Card key={issue.id || index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{issue.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.category === 'Environmental' ? 'bg-green-100 text-green-800' :
                          issue.category === 'Social' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {issue.category}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Financial Materiality</span>
                          <span className={`text-sm ${getScoreLabelColor(issue.financialMateriality)}`}>
                            {issue.financialMateriality}/10
                          </span>
                        </div>
                        <Slider 
                          value={[issue.financialMateriality]} 
                          min={1} 
                          max={10} 
                          step={1}
                          onValueChange={(value) => handleFinancialRatingChange(index, value)}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Impact Materiality</span>
                          <span className={`text-sm ${getScoreLabelColor(issue.impactMateriality)}`}>
                            {issue.impactMateriality}/10
                          </span>
                        </div>
                        <Slider 
                          value={[issue.impactMateriality]} 
                          min={1} 
                          max={10} 
                          step={1}
                          onValueChange={(value) => handleImpactRatingChange(index, value)}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Maturity</span>
                          <span className={`text-sm ${getScoreLabelColor(issue.maturity || 5)}`}>
                            {issue.maturity || 5}/10
                          </span>
                        </div>
                        <Slider 
                          value={[issue.maturity || 5]} 
                          min={1} 
                          max={10} 
                          step={1}
                          onValueChange={(value) => handleMaturityRatingChange(index, value)}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      {issue.description && (
                        <p className="text-xs text-muted-foreground">{issue.description}</p>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button 
            type="button" 
            onClick={onNext}
            disabled={issues.length === 0}
          >
            Next: Stakeholder Input
          </Button>
        </div>
      </form>
    </Form>
  );
}
