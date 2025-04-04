
import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { AddUserFormValues } from "../useAddUserForm";

interface RoleFieldProps {
  form: UseFormReturn<AddUserFormValues>;
}

export function RoleField({ form }: RoleFieldProps) {
  return (
    <FormField
      control={form.control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Role</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="client_admin">Client Admin</SelectItem>
              <SelectItem value="consultant">Consultant</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            This determines the user's permissions
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
