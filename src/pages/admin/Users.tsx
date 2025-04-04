
import React, { useState } from 'react';
import { UserLayout } from '@/components/user/UserLayout';
import { UserTable } from '@/components/admin/users/UserTable';
import { UserProfile } from '@/services/base/supabaseService';

const Users = () => {
  // Mock data for users - in a real app, this would come from an API call
  const [users, setUsers] = useState<UserProfile[]>([]);
  
  // Handler functions for UserTable
  const handleManageUser = (user: UserProfile) => {
    console.log('Managing user:', user);
    // Implement user management logic here
  };
  
  const handleDeleteUser = (user: UserProfile) => {
    console.log('Deleting user:', user);
    // Implement user deletion logic here
    // Then update the users state
    setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
  };

  return (
    <UserLayout title="User Management">
      <div className="space-y-6">
        <UserTable 
          users={users} 
          onManageUser={handleManageUser}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    </UserLayout>
  );
};

export default Users;
