
import React from 'react';
import { UserLayout } from '@/components/user/UserLayout';
import { NotificationsTab } from '@/components/consultant/NotificationsTab';

const Notifications = () => {
  return (
    <UserLayout title="Consultant Notifications">
      <NotificationsTab />
    </UserLayout>
  );
};

export default Notifications;
