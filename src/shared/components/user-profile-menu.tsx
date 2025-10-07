'use client';

import React from 'react';
import {
  HeaderGlobalAction,
  Dropdown,
} from '@carbon/react';
import { User } from '@carbon/icons-react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useLogout } from '@/hooks/queries/use-auth-queries';
import { useRouter } from '@/lib/i18n/routing';
import { useLanguageFont } from '@/shared/hooks/use-language-font';
import '@/shared/styles/components.css';

export const UserProfileMenu: React.FC = () => {
  const t = useTranslations();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const router = useRouter();
  const { isNepali } = useLanguageFont();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login
      router.push('/admin/login');
    }
  };

  if (!user) {
    return null;
  }

  const menuItems = [
    {
      text: 'Profile',
      value: 'profile',
      disabled: true,
    },
    {
      text: 'Settings',
      value: 'settings',
      disabled: true,
    },
    {
      text: t('nav.logout'),
      value: 'logout',
      disabled: logoutMutation.isPending,
    },
  ];

  interface MenuItem {
    text: string;
    value: string;
    disabled?: boolean;
  }

  const handleMenuSelect = ({ selectedItem }: { selectedItem: MenuItem | null }) => {
    if (selectedItem?.value === 'logout') {
      handleLogout();
    }
  };

  return (
    <div className="user-profile-menu">
      {/* User info display */}
      <div className="user-profile-info">
        <p className="user-profile-name font-dynamic">
          {user.firstName} {user.lastName}
        </p>
        <p className="user-profile-role font-dynamic">{user.role}</p>
      </div>
      
      {/* User menu dropdown */}
      <Dropdown
        id="user-menu"
        titleText=""
        label="-----"
        items={menuItems}
        itemToString={(item) => item?.text || ''}
        selectedItem={null}
        onChange={handleMenuSelect}
        size="sm"
        type="inline"
        renderSelectedItem={() => (
          <HeaderGlobalAction
            aria-label="User menu"
            tooltipAlignment="end"
          >
            <User size={20} />
          </HeaderGlobalAction>
        )}
      />
    </div>
  );
}; 