
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Empower Your Business with ESG Excellence
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Transform your Mediterranean SME with our comprehensive ESG platform. 
                Get a detailed diagnosis, understand your impacts, and build a sustainable future.
              </motion.p>
              <motion.div 
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link to="/assessment">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                    Start Assessment
                  </Button>
                </Link>
                <Link to="/assessment">
                  <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                src="/lovable-uploads/163720d8-fbe9-442f-abe6-8cdf59b26473.png"
                alt="Mediterranean landscape"
                className="w-full rounded-2xl shadow-xl animate-float"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
            </motion.div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why Choose ELIA GO?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides comprehensive tools and insights to help your business thrive in the sustainable economy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-6 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-200 hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-semibold text-primary mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

const features = [
  {
    title: "ESG Assessment",
    description: "Get a comprehensive analysis of your company's ESG performance through our advanced diagnostic tools."
  },
  {
    title: "Impact Analysis",
    description: "Understand your business's environmental and social impacts with detailed insights and recommendations."
  },
  {
    title: "Strategy Development",
    description: "Create a tailored ESG strategy that aligns with your business goals and stakeholder expectations."
  },
  {
    title: "Training & Education",
    description: "Access expert-led training modules to build your team's ESG capabilities and knowledge."
  },
  {
    title: "Performance Tracking",
    description: "Monitor your progress with real-time metrics and comprehensive reporting tools."
  },
  {
    title: "Mediterranean Focus",
    description: "Specialized insights and solutions designed specifically for Mediterranean SMEs."
  }
];

export default Index;
