
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextAnalysisForm } from "@/components/ai/TextAnalysisForm";
import { FileAnalysisUpload } from "@/components/ai/FileAnalysisUpload";
import { FileText, File, BrainCircuit } from "lucide-react";

export default function AIAnalysis() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 page-header-spacing pb-12">
        <div className="flex flex-col items-center mb-8">
          <BrainCircuit className="h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2 text-center">
            AI Data Analysis
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl text-center">
            Leverage AI to analyze your text and files for insights, sentiment, and key information
          </p>
        </div>

        <Tabs defaultValue="text" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Text Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              <span>File Analysis</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <TextAnalysisForm />
          </TabsContent>
          <TabsContent value="file">
            <FileAnalysisUpload />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
