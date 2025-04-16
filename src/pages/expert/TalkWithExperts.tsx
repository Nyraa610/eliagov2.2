
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EliaAIChat } from '@/components/assessment/ai/EliaAIChat';
import { Leaf, Users, Building, LightbulbIcon, BookOpen, FileText } from 'lucide-react';

export default function TalkWithExperts() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-emerald-800 mb-2">Talk with ESG & Business Experts</h1>
            <p className="text-muted-foreground">
              Get personalized guidance on sustainability, ESG strategy, and using the ELIA platform.
            </p>
          </div>
          
          <Tabs defaultValue="environmental" className="mb-6">
            <TabsList className="w-full grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="environmental" className="flex items-center gap-1">
                <Leaf className="h-4 w-4" /> Environmental
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-1">
                <Users className="h-4 w-4" /> Social
              </TabsTrigger>
              <TabsTrigger value="governance" className="flex items-center gap-1">
                <Building className="h-4 w-4" /> Governance
              </TabsTrigger>
              <TabsTrigger value="strategy" className="flex items-center gap-1">
                <LightbulbIcon className="h-4 w-4" /> Strategy
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" /> Learning
              </TabsTrigger>
              <TabsTrigger value="reporting" className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> Reporting
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="environmental" className="p-4 bg-emerald-50 rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2 text-emerald-800">Environmental Topics</h3>
              <p className="mb-4">
                Get expert guidance on climate change, carbon footprint, waste reduction, biodiversity, 
                and other environmental aspects of your ESG strategy.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Carbon emissions measurement and reduction</li>
                <li>Energy efficiency and renewable energy transitions</li>
                <li>Water conservation and management</li>
                <li>Waste minimization and circular economy principles</li>
                <li>Environmental compliance and certifications</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="social" className="p-4 bg-blue-50 rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2 text-blue-700">Social Topics</h3>
              <p className="mb-4">
                Learn about workforce practices, community engagement, human rights, diversity and inclusion, 
                and other social considerations for your business.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Employee engagement and wellbeing programs</li>
                <li>Diversity, equity and inclusion initiatives</li>
                <li>Community investment and stakeholder relationships</li>
                <li>Human rights in operations and supply chains</li>
                <li>Health and safety management systems</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="governance" className="p-4 bg-amber-50 rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2 text-amber-700">Governance Topics</h3>
              <p className="mb-4">
                Understand ethical business practices, board structure, transparency, risk management, 
                and other governance best practices.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Board composition and ESG oversight</li>
                <li>Ethics policies and anti-corruption measures</li>
                <li>ESG risk management frameworks</li>
                <li>Executive compensation and incentives</li>
                <li>Transparency and business integrity</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="strategy" className="p-4 bg-violet-50 rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2 text-violet-700">Strategy Topics</h3>
              <p className="mb-4">
                Discover how to integrate ESG into your business strategy, set meaningful targets, 
                and create long-term sustainable value.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Materiality assessment and prioritization</li>
                <li>Sustainable business model innovation</li>
                <li>ESG goal setting and roadmap development</li>
                <li>Competitive advantage through sustainability</li>
                <li>Stakeholder engagement strategies</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="learning" className="p-4 bg-cyan-50 rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2 text-cyan-700">Learning Topics</h3>
              <p className="mb-4">
                Access educational resources on ESG topics, sustainability trends, 
                and professional development opportunities.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>ESG frameworks and standards overview</li>
                <li>Industry-specific sustainability practices</li>
                <li>Case studies and success stories</li>
                <li>Sustainability certifications and training</li>
                <li>Emerging ESG trends and innovations</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="reporting" className="p-4 bg-rose-50 rounded-md mt-4">
              <h3 className="text-lg font-medium mb-2 text-rose-700">Reporting Topics</h3>
              <p className="mb-4">
                Get assistance with ESG reporting frameworks, data collection, 
                disclosure requirements, and stakeholder communications.
              </p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>GRI, SASB, TCFD and other reporting frameworks</li>
                <li>ESG data collection and management</li>
                <li>Assurance and verification processes</li>
                <li>Stakeholder communication strategies</li>
                <li>Regulatory compliance and disclosures</li>
              </ul>
            </TabsContent>
          </Tabs>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">How Elia Can Help You</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-2">
                    <Leaf className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span>Get expert insights on ESG best practices tailored to your industry</span>
                  </li>
                  <li className="flex gap-2">
                    <LightbulbIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <span>Receive recommendations for your sustainability strategy</span>
                  </li>
                  <li className="flex gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span>Learn about sustainability frameworks and reporting standards</span>
                  </li>
                  <li className="flex gap-2">
                    <FileText className="h-5 w-5 text-violet-600 flex-shrink-0" />
                    <span>Get step-by-step guidance on completing assessments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">About Elia AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Elia is an AI assistant trained on the latest ESG knowledge, sustainability frameworks, 
                  and business practices. Elia can help you:
                </p>
                <ul className="space-y-1 text-sm">
                  <li>• Answer questions about ESG topics and sustainability</li>
                  <li>• Guide you through using the platform's features</li>
                  <li>• Interpret assessment results and provide recommendations</li>
                  <li>• Help you understand regulatory requirements</li>
                  <li>• Suggest next steps for your sustainability journey</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="md:w-1/3">
          <Card className="sticky top-24 border-emerald-800/20">
            <CardHeader className="bg-emerald-800 text-white pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat with Elia
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Your ESG & Business Assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 min-h-[500px] flex items-center justify-center">
              <div className="text-center p-4">
                <EliaAIChat />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
