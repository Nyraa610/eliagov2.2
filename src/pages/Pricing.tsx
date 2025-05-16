
import React from 'react';
import { useTranslation } from 'react-i18next';

export function Pricing() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('pricing.title', 'Pricing')}</h1>
      <p className="text-lg">{t('pricing.description', 'Our pricing information.')}</p>
    </div>
  );
}

export default Pricing;
