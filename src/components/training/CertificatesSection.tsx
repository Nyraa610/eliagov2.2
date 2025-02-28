
import { Award } from "lucide-react";
import { Course, Certificate } from "@/types/training";
import CertificateCard from "./CertificateCard";

interface CertificatesSectionProps {
  certificates: Certificate[];
  courses: Course[];
}

const CertificatesSection = ({ certificates, courses }: CertificatesSectionProps) => {
  if (certificates.length === 0) return null;

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-semibold text-primary mb-6 flex items-center">
        <Award className="mr-2 h-5 w-5" />
        Your Certificates
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certificates.map(certificate => {
          const course = courses.find(c => c.id === certificate.course_id);
          return <CertificateCard key={certificate.id} certificate={certificate} course={course} />;
        })}
      </div>
    </div>
  );
};

export default CertificatesSection;
