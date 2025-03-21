
import { motion } from "framer-motion";
import { Card, CardHeader } from "@/components/ui/card";
import { LanguageSettings } from "@/components/profile/LanguageSettings";

interface LanguageCardProps {
  variants: any;
}

export function LanguageCard({ variants }: LanguageCardProps) {
  return (
    <motion.div variants={variants}>
      <Card>
        <CardHeader>
          <LanguageSettings />
        </CardHeader>
      </Card>
    </motion.div>
  );
}
