
import { UserProfile } from "@/services/base/profileTypes";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { CompanySection } from "@/components/profile/CompanySection";
import { LanguageSettings } from "@/components/profile/LanguageSettings";

interface ProfileContentProps {
  profile: UserProfile | null;
  isAdmin: boolean;
  onCompanyCreated: () => void;
}

export function ProfileContent({ profile, isAdmin, onCompanyCreated }: ProfileContentProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-6"
    >
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <ProfileHeader isAdmin={isAdmin} />
          </CardHeader>
          <CardContent className="space-y-6">
            <PersonalInfoForm profile={profile} />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <CompanySection profile={profile} onCompanyCreated={onCompanyCreated} />
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <LanguageSettings />
          </CardHeader>
        </Card>
      </motion.div>
    </motion.div>
  );
}
