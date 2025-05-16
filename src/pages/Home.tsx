
import React from 'react';
import { useTranslation } from 'react-i18next';

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('home.title', 'Welcome')}</h1>
      <p className="text-lg">{t('home.welcome', 'Welcome to our application.')}</p>
    </div>
  );
}

export default Home;
