'use client';

import React from 'react';
import NgoProfile from './NgoProfile';
import UserProfile from './UserProfile';
import MainHeadline from '@/components/MainHeadline';
import { useAuth } from '@/contexts/AuthContext';
import { getUserEntityType } from '@/lib/user-utils';

const ProfilePage = () => {
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
        {entityType === 'user' ? 'Mein Profil' : 'Vereinsprofil'}
      </MainHeadline>

      <div className='pb-16'>
        {entityType === 'user' ? <UserProfile /> : <NgoProfile />}
      </div>
    </div>
  );
};

export default ProfilePage;
