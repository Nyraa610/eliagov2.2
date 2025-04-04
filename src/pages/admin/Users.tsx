
import React from 'react';
import { UserLayout } from '@/components/user/UserLayout';
import { UserTable } from '@/components/admin/users/UserTable';

const Users = () => {
  return (
    <UserLayout title="User Management">
      <div className="space-y-6">
        <UserTable />
      </div>
    </UserLayout>
  );
};

export default Users;
