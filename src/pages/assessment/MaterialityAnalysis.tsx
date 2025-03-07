
import { useState } from "react";
import { UserLayout } from "@/components/user/UserLayout";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface MaterialityItem {
  id: string;
  category: string;
  topic: string;
  businessImpact: number;
  stakeholderConcern: number;
}

export default function MaterialityAnalysis() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("introduction");
  
  const [materialityItems, setMaterialityItems] = useState<MaterialityItem[]>([
    { id: "env1", category: "Environmental", topic: "Greenhouse Gas Emissions", businessImpact: 60, stakeholderConcern: 80 },
    { id: "env2", category: "Environmental", topic: "Energy Consumption", businessImpact: 70, stakeholderConcern: 60 },
    { id: "env3", category: "Environmental", topic: "Water Management", businessImpact: 40, stakeholderConcern: 50 },
    { id: "env4", category: "Environmental", topic: "Waste & Circular Economy", businessImpact: 50, stakeholderConcern: 60 },
    { id: "soc1", category: "Social", topic: "Diversity & Inclusion", businessImpact: 50, stakeholderConcern: 70 },
    { id: "soc2", category: "Social", topic: "Human Rights", businessImpact: 60, stakeholderConcern: 80 },
    { id: "soc3", category: "Social", topic: "Employee Health & Safety", businessImpact: 80, stakeholderConcern: 70 },
    { id: "soc4", category: "Social", topic: "Community Engagement", businessImpact: 40, stakeholderConcern: 60 },
    { id: "gov1", category: "Governance", topic: "Business Ethics", businessImpact: 70, stakeholderConcern: 80 },
    { id: "gov2", category: "Governance", topic: "Risk Management", businessImpact: 80, stakeholderConcern: 60 },
    { id: "gov3", category: "Governance", topic: "Data Privacy & Security", businessImpact: 90, stakeholderConcern: 80 },
    { id: "gov4", category: "Governance", topic: "Regulatory Compliance", businessImpact: 85, stakeholderConcern: 70 },
  ]);

  const updateItemValue = (id: string, field: "businessImpact" | "stakeholderConcern", value: number) => {
    setMaterialityItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const tabs = [
    { id: "introduction", label: "Introduction" },
    { id: "assessment", label: "Assessment" },
    { id: "matrix", label: "Materiality Matrix" },
    { id: "report", label: "Report" }
  ];

  // Group items by category
  const itemsByCategory = materialityItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MaterialityItem[]>);

  // Calculate high-priority items (high business impact and stakeholder concern)
  const highPriorityItems = materialityItems.filter(
    item => item.businessImpact >= 70 && item.stakeholderConcern >= 70
  );

  return (
    <UserLayout title={t("assessment.materialityAnalysis.title")}>
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <p className="text-gray-600">
          {t("assessment.materialityAnalysis.description")}
        </p>
      </div>
      
      <AssessmentBase 
        title={t("assessment.materialityAnalysis.title")} 
        description={t("assessment.materialityAnalysis.description")}
        status="in-progress"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <Progress value={
              activeTab === "introduction" ? 25 : 
              activeTab === "assessment" ? 50 : 
              activeTab === "matrix" ? 75 : 100
            } className="h-2" />
          </div>
          
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 mb-6">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="introduction" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Double Materiality Analysis</CardTitle>
                <CardDescription>
                  Understanding the impact of environmental and social issues on your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-muted/30 rounded-lg">
                  <Info className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium mb-2">What is Double Materiality?</h3>
                    <p className="text-sm text-muted-foreground">
                      Double materiality considers both:
                    </p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1 mt-2">
                      <li><strong>Impact on business:</strong> How ESG issues affect financial performance</li>
                      <li><strong>Impact on stakeholders:</strong> How the company affects people, environment, and society</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Process Overview</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Rate the importance of each ESG topic to your business performance</li>
                    <li>Rate how important each topic is to your stakeholders</li>
                    <li>Review the materiality matrix visualization</li>
                    <li>Identify your priority ESG topics for reporting and action</li>
                  </ol>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("assessment")}>
                    Start Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assessment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rate ESG Topics</CardTitle>
                <CardDescription>
                  For each topic, rate its importance to your business and your stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Topic</TableHead>
                        <TableHead className="w-[300px]">Business Impact</TableHead>
                        <TableHead className="w-[300px]">Stakeholder Concern</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(itemsByCategory).map(([category, items]) => (
                        <>
                          <TableRow key={category} className="bg-muted/30">
                            <TableCell colSpan={3} className="font-medium">{category}</TableCell>
                          </TableRow>
                          {items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.topic}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-4">
                                  <Slider
                                    value={[item.businessImpact]}
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="w-52"
                                    onValueChange={(value) => updateItemValue(item.id, "businessImpact", value[0])}
                                  />
                                  <span className="text-sm w-8">{item.businessImpact}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-4">
                                  <Slider
                                    value={[item.stakeholderConcern]}
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="w-52"
                                    onValueChange={(value) => updateItemValue(item.id, "stakeholderConcern", value[0])}
                                  />
                                  <span className="text-sm w-8">{item.stakeholderConcern}%</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setActiveTab("introduction")}>
                    Previous
                  </Button>
                  <Button onClick={() => setActiveTab("matrix")}>
                    View Matrix
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="matrix" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Materiality Matrix</CardTitle>
                <CardDescription>
                  Visualization of ESG topics based on business impact and stakeholder concern
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-[500px] border rounded-lg p-4 mb-8">
                  <div className="absolute top-2 right-2 bottom-2 left-2">
                    {/* Matrix background */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                      <div className="bg-red-50"></div>
                      <div className="bg-red-100"></div>
                      <div className="bg-green-50"></div>
                      <div className="bg-green-100"></div>
                    </div>
                    
                    {/* Axis labels */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 transform rotate-90 text-xs">
                      Stakeholder Concern
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 text-xs">
                      Business Impact
                    </div>
                    
                    {/* High priority label */}
                    <div className="absolute top-2 right-2 bg-green-100 p-2 rounded text-xs font-bold">
                      High Priority
                    </div>
                    
                    {/* Plot points */}
                    {materialityItems.map((item) => (
                      <div 
                        key={item.id}
                        className="absolute rounded-full bg-primary text-white text-xs flex items-center justify-center w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 cursor-help"
                        style={{ 
                          left: `${item.businessImpact}%`, 
                          top: `${100 - item.stakeholderConcern}%`,
                          backgroundColor: item.category === 'Environmental' ? 'rgb(34, 197, 94)' : 
                                          item.category === 'Social' ? 'rgb(59, 130, 246)' : 
                                          'rgb(168, 85, 247)'
                        }}
                        title={`${item.topic}\nBusiness: ${item.businessImpact}%\nStakeholders: ${item.stakeholderConcern}%`}
                      >
                        {item.topic.substring(0, 2)}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setActiveTab("assessment")}>
                    Previous
                  </Button>
                  <Button onClick={() => setActiveTab("report")}>
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="report" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Double Materiality Report</CardTitle>
                <CardDescription>
                  Summary of your double materiality analysis results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">High Priority Topics</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    These topics have both high business impact and high stakeholder concern.
                  </p>
                  
                  {highPriorityItems.length > 0 ? (
                    <ul className="space-y-2">
                      {highPriorityItems.map(item => (
                        <li key={item.id} className="flex items-center gap-2 p-2 border rounded">
                          <span className={`w-3 h-3 rounded-full ${
                            item.category === 'Environmental' ? 'bg-green-500' : 
                            item.category === 'Social' ? 'bg-blue-500' : 
                            'bg-purple-500'
                          }`}></span>
                          <span className="font-medium">{item.topic}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {item.category}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic">No high priority topics identified</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Key Recommendations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Based on your materiality analysis, we recommend:
                  </p>
                  
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Focus your ESG strategy on the high priority topics identified</li>
                    <li>Develop specific KPIs and targets for these material topics</li>
                    <li>Ensure these material topics are prominently addressed in your sustainability reporting</li>
                    <li>Establish regular stakeholder engagement processes to reassess priorities</li>
                  </ul>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setActiveTab("matrix")}>
                    Previous
                  </Button>
                  <Button type="submit">
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AssessmentBase>
    </UserLayout>
  );
}
