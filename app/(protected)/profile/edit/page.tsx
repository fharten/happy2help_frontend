'use client';

import React from 'react';
import NgoProfileForm from './NgoProfileForm';
import UserProfileForm from './UserProfileForm';
import MainHeadline from '@/components/MainHeadline';
import { useAuth } from '@/contexts/AuthContext';
import { getUserEntityType } from '@/lib/user-utils';

const ProfileEditPage = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div>Lade...</div>
      </div>
    );
  }

  const entityType = getUserEntityType(user!);

  return (
    <div className='min-h-screen bg-white'>
      <MainHeadline>
        {entityType === 'user'
          ? 'Profil bearbeiten'
          : 'Vereinsprofil bearbeiten'}
      </MainHeadline>

      <div className='pb-16'>
        {entityType === 'user' ? <UserProfileForm /> : <NgoProfileForm />}
      </div>
    </div>
  );
};

export default ProfileEditPage;
