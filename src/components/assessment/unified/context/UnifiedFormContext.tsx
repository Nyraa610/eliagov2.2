
import React, { createContext, useContext } from "react";
import { UseFormReturn } from "react-hook-form";
import { ESGFormValues } from "../../esg-diagnostic/ESGFormSchema";

type UnifiedFormContextType = {
  form: UseFormReturn<ESGFormValues>;
  isSubmitting: boolean;
  userCompany: string | null;
  onTabChange: (tab: string) => void;
  onSubmit: (values: ESGFormValues) => void;
};

const UnifiedFormContext = createContext<UnifiedFormContextType | undefined>(undefined);

export const UnifiedFormProvider = ({ children, value }: { children: React.ReactNode; value: UnifiedFormContextType }) => {
  return <UnifiedFormContext.Provider value={value}>{children}</UnifiedFormContext.Provider>;
};

export const useUnifiedFormContext = () => {
  const context = useContext(UnifiedFormContext);
  if (context === undefined) {
    throw new Error("useUnifiedFormContext must be used within a UnifiedFormProvider");
  }
  return context;
};
