
import React from 'react';
import { UserLayout } from '@/components/user/UserLayout';
import { DocumentsLayout } from '@/components/documents/DocumentsLayout';

const Documents = () => {
  return (
    <UserLayout title="Document Center">
      <DocumentsLayout />
    </UserLayout>
  );
};

export default Documents;
