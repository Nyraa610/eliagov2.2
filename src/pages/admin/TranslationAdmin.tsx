
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { TranslationManagement } from '@/components/admin/translation/TranslationManagement';
import { useTranslation } from 'react-i18next';

export default function TranslationAdmin() {
  const { t } = useTranslation();

  return (
    <AdminLayout 
      title={t('admin.translations.pageTitle', 'Translation Management')}
      description={t('admin.translations.pageDescription', 'Manage application translations and language settings')}
    >
      <TranslationManagement />
    </AdminLayout>
  );
}
