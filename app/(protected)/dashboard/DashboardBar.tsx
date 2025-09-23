'use client';

import ButtonComponent from '@/components/ButtonComponent';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDisplayName } from '@/lib/user-utils';

const DashboardBar = () => {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuth();

  const [displayName, setDisplayName] = useState<string>('Account');
  const [isHydrated, setIsHydrated] = useState(false);

  // HYDRATION
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // UPDATE DISPLAY NAME WHEN USER CHANGES
  useEffect(() => {
    const loadUserName = async () => {
      if (isHydrated && (!isAuthenticated || !user)) {
        setDisplayName('Account');
        return;
      }

      try {
        const displayName = await getUserDisplayName({
          user,
        });
        setDisplayName(displayName);
      } catch (error) {
        console.warn('Error loading user display name:', error);
        setDisplayName('Account');
      }
    };

    loadUserName();
  }, [isAuthenticated, isHydrated, user]);

  return (
    <div className='w-full mb-6 container-site'>
      <div className='bg-white/80 backdrop-blur-xl rounded-[2rem] border border-light-mint/20 p-6 lg:p-8 mt-12'>
        {/* Mobile Layout: Stacked */}
        <div className='flex flex-col space-y-4 lg:hidden'>
          <div>
            <h2 className='text-xl font-bold text-prussian mb-1 tracking-tight'>
              {isLoading ? 'Dashboard' : `Hallo, ${displayName}!`}
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
          </div>
        </div>

        {/* Desktop Layout: Side by side */}
        <div className='hidden lg:flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-prussian mb-1 tracking-tight'>
              {isLoading ? 'Dashboard' : `Hallo, ${displayName}!`}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBar;
