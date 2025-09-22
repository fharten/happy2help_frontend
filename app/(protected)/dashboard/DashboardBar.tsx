'use client';

import ButtonComponent from '@/components/ButtonComponent';
import { Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import { getUserId, getUserType } from '@/lib/auth';
import { User } from '@/types/user.d';
import { Ngo } from '@/types/ngo.d';
import { swrFetcher } from '@/contexts/AuthContext';

const DashboardBar = () => {
  const [themeIsDark, setThemeIsDark] = useState(false);
  const router = useRouter();

  // Get user info for personalized greeting
  const userId = getUserId();
  const userType = getUserType();

  // Fetch user or NGO data based on user type
  const { data, isLoading } = useSWR<{ data: User | Ngo }>(
    userId && userType
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/${userType}/${userId}`
      : null,
    swrFetcher,
  );

  // Get display name based on user type
  const getDisplayName = () => {
    if (!data?.data) return '';

    if (userType === 'users') {
      const user = data.data as User;
      return user.firstName || 'Benutzer';
    } else {
      const ngo = data.data as Ngo;
      return ngo.name || 'Organisation';
    }
  };

  return (
    <div className='w-full mb-6 container-site'>
      <div className='bg-white/80 backdrop-blur-xl rounded-[2rem] border border-light-mint/20 p-6 lg:p-8 mt-12'>
        {/* Mobile Layout: Stacked */}
        <div className='flex flex-col space-y-4 lg:hidden'>
          <div>
            <h2 className='text-xl font-bold text-prussian mb-1 tracking-tight'>
              {isLoading ? 'Dashboard' : `Hallo ${getDisplayName()}`}
            </h2>
            <p className='text-prussian/70 text-sm font-medium'>
              Verwalte dein Profil und deine Einstellungen
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <ButtonComponent
              onClick={() => router.push('/profile')}
              variant='primary'
              size='sm'
            >
              Profil bearbeiten
            </ButtonComponent>
            <ButtonComponent
              onClick={() => setThemeIsDark(!themeIsDark)}
              variant='action'
              size='sm'
            >
              {themeIsDark ? <Moon size={16} /> : <Sun size={16} />}
            </ButtonComponent>
          </div>
        </div>

        {/* Desktop Layout: Side by side */}
        <div className='hidden lg:flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-prussian mb-1 tracking-tight'>
              {isLoading ? 'Dashboard' : `Hallo ${getDisplayName()}`}
            </h2>
            <p className='text-prussian/70 text-base font-medium'>
              Verwalte dein Profil und deine Einstellungen
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <ButtonComponent
              onClick={() => router.push('/profile')}
              variant='primary'
              size='md'
            >
              Profil bearbeiten
            </ButtonComponent>
            <ButtonComponent
              onClick={() => setThemeIsDark(!themeIsDark)}
              variant='action'
            >
              {themeIsDark ? <Moon size={18} /> : <Sun size={18} />}
            </ButtonComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBar;
