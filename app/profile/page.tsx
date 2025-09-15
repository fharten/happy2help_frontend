'use client';

import React from 'react';
import NgoProfileForm from './NgoProfileForm';
import UserProfileForm from './UserProfileForm';
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

  if (!userType) return <div>Lade...</div>;

  return <>{userType === 'users' ? <UserProfileForm /> : <NgoProfileForm />}</>;
};

export default ProfilePage;
