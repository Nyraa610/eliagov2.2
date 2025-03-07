
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const AuthButtons = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <Link to="/login">
        <Button variant="outline">
          {t('auth.login')}
        </Button>
      </Link>
      <Link to="/register">
        <Button>
          {t('auth.register')}
        </Button>
      </Link>
    </>
  );
};
