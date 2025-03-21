
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { UserProfile } from "@/services/base/profileTypes";

interface PersonalInfoCardProps {
  profile: UserProfile | null;
  isAdmin: boolean;
  variants: any;
}

export function PersonalInfoCard({ profile, isAdmin, variants }: PersonalInfoCardProps) {
  return (
    <motion.div variants={variants}>
      <Card>
        <CardHeader>
          <ProfileHeader isAdmin={isAdmin} />
        </CardHeader>
        <CardContent className="space-y-6">
          <PersonalInfoForm profile={profile} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
