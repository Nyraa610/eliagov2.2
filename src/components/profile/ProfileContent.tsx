
import { UserProfile } from "@/services/base/profileTypes";
import { motion } from "framer-motion";
import { useProfileAnimations } from "@/hooks/useProfileAnimations";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { AdminSection } from "@/components/profile/AdminSection";
import { CompanySection } from "@/components/profile/CompanySection";
import { LanguageCard } from "@/components/profile/LanguageCard";

interface ProfileContentProps {
  profile: UserProfile | null;
  isAdmin: boolean;
  onCompanyCreated: () => void;
  onProfileUpdated: () => void;
}

export function ProfileContent({ 
  profile, 
  isAdmin, 
  onCompanyCreated,
  onProfileUpdated
}: ProfileContentProps) {
  const { container, item } = useProfileAnimations();

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-6"
    >
      <PersonalInfoCard 
        profile={profile} 
        isAdmin={isAdmin} 
        variants={item}
        onProfileUpdated={onProfileUpdated} 
      />

      {isAdmin && (
        <motion.div variants={item}>
          <AdminSection />
        </motion.div>
      )}

      <motion.div variants={item}>
        <CompanySection profile={profile} onCompanyCreated={onCompanyCreated} />
      </motion.div>

      <LanguageCard variants={item} />
    </motion.div>
  );
}
