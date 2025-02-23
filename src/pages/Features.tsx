
import { Navigation } from "@/components/Navigation";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Features = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-primary mb-4">Our Features</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how ELIA GO helps Mediterranean SMEs excel in their ESG journey with our comprehensive suite of features.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white/60 backdrop-blur-sm p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <p className="text-sm text-gray-500">{feature.details}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link to="/assessment">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Start Your ESG Journey
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

// Import icons from lucide-react
import { 
  BarChart3, 
  LineChart, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Globe,
  Award,
  Users,
  Shield
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "ESG Assessment",
    description: "Get a comprehensive analysis of your company's ESG performance through our advanced diagnostic tools.",
    details: "AI-powered assessment engine with industry-specific benchmarks"
  },
  {
    icon: LineChart,
    title: "Impact Analysis",
    description: "Understand your business's environmental and social impacts with detailed insights and recommendations.",
    details: "Real-time monitoring and data-driven impact measurements"
  },
  {
    icon: Target,
    title: "Strategy Development",
    description: "Create a tailored ESG strategy that aligns with your business goals and stakeholder expectations.",
    details: "Customized action plans and milestone tracking"
  },
  {
    icon: BookOpen,
    title: "Training & Education",
    description: "Access expert-led training modules to build your team's ESG capabilities and knowledge.",
    details: "Interactive learning modules and certification programs"
  },
  {
    icon: TrendingUp,
    title: "Performance Tracking",
    description: "Monitor your progress with real-time metrics and comprehensive reporting tools.",
    details: "Automated reporting and performance analytics"
  },
  {
    icon: Globe,
    title: "Mediterranean Focus",
    description: "Specialized insights and solutions designed specifically for Mediterranean SMEs.",
    details: "Region-specific compliance and best practices"
  },
  {
    icon: Award,
    title: "Certification Support",
    description: "Get guidance and support for achieving relevant ESG certifications and standards.",
    details: "Step-by-step certification preparation and documentation"
  },
  {
    icon: Users,
    title: "Stakeholder Engagement",
    description: "Tools and frameworks for effective communication with all stakeholders.",
    details: "Customizable reporting templates and engagement strategies"
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Identify and mitigate ESG-related risks before they impact your business.",
    details: "Proactive risk assessment and mitigation planning"
  }
];

export default Features;
