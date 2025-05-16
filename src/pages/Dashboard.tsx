
import React from 'react';
import { useTranslation } from 'react-i18next';

export function Dashboard() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('dashboard.title', 'Dashboard')}</h1>
      <p className="text-lg">{t('dashboard.welcome', 'Welcome to your dashboard.')}</p>
    </div>
  );
}

export default Dashboard;
