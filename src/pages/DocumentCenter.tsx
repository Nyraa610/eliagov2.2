
import { UserLayout } from "@/components/user/UserLayout";
import { DocumentsLayout } from "@/components/documents/DocumentsLayout";

export default function DocumentCenter() {
  return (
    <UserLayout title="Document Center">
      <DocumentsLayout />
    </UserLayout>
  );
}
