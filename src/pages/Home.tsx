
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserLayout } from '@/components/user/UserLayout';

const Home = () => {
  const navigate = useNavigate();

  return (
    <UserLayout title="Home">
      <div className="max-w-5xl mx-auto">
        <div className="my-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to the ESG Platform</h1>
          <p className="mt-4 text-xl text-gray-600">
            Your comprehensive solution for ESG assessment, training, and engagement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">ESG Assessment</h2>
            <p className="text-gray-600 mb-4">
              Evaluate your company's ESG performance with our comprehensive assessment tools.
            </p>
            <Button onClick={() => navigate('/assessment')} className="w-full">
              Start Assessment
            </Button>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Training</h2>
            <p className="text-gray-600 mb-4">
              Access training modules to improve your understanding of ESG concepts and practices.
            </p>
            <Button onClick={() => navigate('/training')} className="w-full">
              Explore Training
            </Button>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Engagement</h2>
            <p className="text-gray-600 mb-4">
              Track engagement activities and build a culture of sustainability within your organization.
            </p>
            <Button onClick={() => navigate('/engagement')} className="w-full">
              View Engagement
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Home;
