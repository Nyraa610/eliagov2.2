
import React from 'react';
import { useTranslation } from 'react-i18next';

export function About() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('about.title', 'About Us')}</h1>
      <p className="text-lg">{t('about.description', 'Learn more about our company and mission.')}</p>
    </div>
  );
}

export default About;
