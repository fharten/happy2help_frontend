'use client';

import React from 'react';
import NgoProfile from './NgoProfile';
import UserProfile from './UserProfile';
import MainHeadline from '@/components/MainHeadline';
import { useEffect, useState } from 'react';
import { getUserType, isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const type = getUserType();
    setUserType(type);
  }, [router]);

  if (!userType)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div>Lade...</div>
      </div>
    );

  return (
    <div className='min-h-screen bg-white'>
      <MainHeadline>
        {userType === 'users' ? 'Mein Profil' : 'Vereinsprofil'}
      </MainHeadline>

      <div className='pb-16'>
        {userType === 'users' ? <UserProfile /> : <NgoProfile />}
      </div>
    </div>
  );
};

export default ProfilePage;
