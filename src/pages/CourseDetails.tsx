
import React from 'react';
import { Navigation } from "@/components/Navigation";
import { useParams } from 'react-router-dom';

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      <div className="container mx-auto px-4 page-header-spacing">
        <h1 className="text-3xl font-bold mb-4">Course Details</h1>
        <p>Viewing course ID: {courseId}</p>
      </div>
    </div>
  );
}
