
import React, { createContext, useContext } from "react";
import { UseFormReturn } from "react-hook-form";
import { ESGFormValues } from "../ESGFormSchema";

type FormContextType = {
  form: UseFormReturn<ESGFormValues>;
  isSubmitting: boolean;
  userCompany: string | null;
  onTabChange: (tab: string) => void;
  onSubmit: (values: ESGFormValues) => void;
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvider = ({ children, value }: { children: React.ReactNode; value: FormContextType }) => {
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error("useFormContext must be used within a FormProvider");
  }
  return context;
};
