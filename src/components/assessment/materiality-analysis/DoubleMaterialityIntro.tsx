
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react"; // Changed from LightBulb to Lightbulb

export function DoubleMaterialityIntro() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-b from-primary/10 to-primary/5 p-6 rounded-xl">
        <h1 className="text-3xl font-bold text-primary mb-2">Materiality Assessment</h1>
        <h2 className="text-xl text-primary/90 mb-4">Unlock the Core of Your ESG Strategy</h2>
        
        <p className="text-gray-700">
          Welcome to the Double Materiality Assessment step, where your journey towards an effective Environmental, Social, and Governance (ESG)
          strategy begins. This critical process helps you pinpoint the most significant ESG issues that affect your business and stakeholders,
          allowing you to prioritize them in your strategic planning.
        </p>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Why Double Materiality Assessment?</h2>
        <h3 className="text-lg font-medium text-primary mb-2">Prioritize What Matters Most</h3>
        
        <ul className="space-y-4 mt-4">
          <li className="flex gap-3">
            <div className="flex-shrink-0 mt-1">•</div>
            <div>
              <span className="font-semibold">Identify Key Issues:</span> Understand which environmental, social, and governance factors are most significant to
              your operations and your stakeholders.
            </div>
          </li>
          <li className="flex gap-3">
            <div className="flex-shrink-0 mt-1">•</div>
            <div>
              <span className="font-semibold">Strategic Alignment:</span> Align your business strategies with the ESG issues that carry the most weight, ensuring
              that your efforts are focused and impactful.
            </div>
          </li>
          <li className="flex gap-3">
            <div className="flex-shrink-0 mt-1">•</div>
            <div>
              <span className="font-semibold">Stakeholder Engagement:</span> Enhance engagement by addressing the concerns that matter most to your
              stakeholders, thereby improving relations and supporting compliance and reporting needs.
            </div>
          </li>
        </ul>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" /> {/* Changed from LightBulb to Lightbulb */}
            Double Materiality Explained
          </CardTitle>
          <CardDescription>
            Understanding the two perspectives of materiality assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-primary">Financial Materiality (0-10)</h4>
            <p className="text-gray-600">
              Assesses how ESG issues impact your company's financial performance, value, and risks.
              Higher scores indicate greater financial relevance to your business.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-primary">Impact Materiality (0-10)</h4>
            <p className="text-gray-600">
              Evaluates how your company's activities affect people, the environment, and society.
              Higher scores reflect greater social and environmental impacts.
            </p>
          </div>
          
          <div className="pt-2">
            <p className="text-gray-700 italic">
              Double materiality ensures a comprehensive view by examining both the financial impact on your company 
              and your company's impact on the world.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex gap-2">
              <span className="font-medium text-primary">1.</span>
              <span>Use our AI-powered assessment to identify relevant ESG issues for your industry and business</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">2.</span>
              <span>Review and adjust the automatically evaluated financial and impact materiality scores</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">3.</span>
              <span>Add stakeholder input to refine your assessment</span>
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-primary">4.</span>
              <span>View your materiality matrix visualization to prioritize ESG issues</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
