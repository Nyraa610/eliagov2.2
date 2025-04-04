
import React from "react";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { AddUserFormValues } from "../useAddUserForm";

interface EmailFieldProps {
  form: UseFormReturn<AddUserFormValues>;
}

export function EmailField({ form }: EmailFieldProps) {
  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="user@example.com" {...field} />
          </FormControl>
          <FormDescription>
            This email will be used for login
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
