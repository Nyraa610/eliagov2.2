
import React from 'react';
import { useTranslation } from 'react-i18next';

export function Account() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('account.title', 'Account Settings')}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">{t('account.personalInfo', 'Personal Information')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile information would go here */}
              <p className="text-gray-500">{t('account.profileSettingsPlaceholder', 'Profile settings will be available soon.')}</p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">{t('account.security', 'Security')}</h2>
            <div className="space-y-4">
              {/* Security settings would go here */}
              <p className="text-gray-500">{t('account.securitySettingsPlaceholder', 'Security settings will be available soon.')}</p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">{t('account.preferences', 'Preferences')}</h2>
            <div className="space-y-4">
              {/* Preferences settings would go here */}
              <p className="text-gray-500">{t('account.preferencesPlaceholder', 'Preference settings will be available soon.')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Account;
