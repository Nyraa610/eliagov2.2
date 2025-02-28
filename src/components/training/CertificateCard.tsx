
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Course, Certificate } from "@/types/training";

interface CertificateCardProps {
  certificate: Certificate;
  course?: Course;
}

const CertificateCard = ({ certificate, course }: CertificateCardProps) => {
  if (!course) return null;

  return (
    <Card key={certificate.id} className="overflow-hidden">
      <div className="bg-primary/10 p-4 flex justify-center">
        <Award className="h-16 w-16 text-primary" />
      </div>
      <CardHeader>
        <CardTitle>{course.title} Certificate</CardTitle>
        <CardDescription>
          Earned {certificate.points_earned} points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Issued on {new Date(certificate.issued_at).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter>
        {certificate.certificate_url ? (
          <a 
            href={certificate.certificate_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              View Certificate
            </Button>
          </a>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Certificate Pending
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default CertificateCard;
