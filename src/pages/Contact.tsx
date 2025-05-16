
import React from 'react';
import { useTranslation } from 'react-i18next';

export function Contact() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('contact.title', 'Contact Us')}</h1>
      <p className="text-lg">{t('contact.description', 'Get in touch with our team.')}</p>
    </div>
  );
}

export default Contact;
