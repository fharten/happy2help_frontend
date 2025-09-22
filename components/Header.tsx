'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { House, LayoutDashboard, Scroll, LogIn, LogOut } from 'lucide-react';
// import NotificationBell from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDisplayName } from '@/lib/user-utils';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user, isLoading } = useAuth();
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

  const handleAuthToggle = () => {
    if (isAuthenticated) {
      logout();
    } else {
      router.push('/login');
    }
  };

  // SHOW LOADING STATE DURING INITIAL LOAR OR AUTH OPERATIONS
  const showLoadingState = !isHydrated || isLoading;

  return (
    <>
      {/* DESKTOP & MOBILE TOP BAR */}
      <header className='bg-white pt-4 pb-3 lg:pt-6 lg:pb-4'>
        <nav aria-label='Main navigation' className='px-4 lg:px-8'>
          <div className='flex justify-center items-center relative'>
            {/* LOGO TEXT */}
            <div className='absolute left-0 flex items-center gap-3 lg:gap-6'>
              <Link
                href='/'
                className='text-xl lg:text-3xl font-bold text-black select-none tracking-tight'
              >
                Happy<span className='text-light-mint'>2Help</span>
              </Link>
            </div>

            {/* DESKTOP NAVIGATION PILL */}
            <div className='hidden xl:flex items-center bg-light-mint/90 backdrop-blur-xl rounded-full px-2 py-2 shadow-xl gap-6'>
              <Link
                href={'/'}
                className={`flex items-center gap-3 px-6 py-2 text-base font-medium rounded-full transition-all duration-200 ${
                  pathname === '/'
                    ? 'bg-white/60 text-prussian font-semibold shadow-lg'
                    : 'text-prussian/70 hover:text-prussian hover:bg-white/30'
                }`}
              >
                <House size={18} strokeWidth={2.5} />
                Homepage
              </Link>
              <Link
                href={'/dashboard'}
                className={`flex items-center gap-3 px-6 py-2 text-base font-medium rounded-full transition-all duration-200 ${
                  pathname === '/dashboard'
                    ? 'bg-white/60 text-prussian font-semibold shadow-lg'
                    : 'text-prussian/70 hover:text-prussian hover:bg-white/30'
                }`}
              >
                <LayoutDashboard size={18} strokeWidth={2.5} />
                Dashboard
              </Link>
              <Link
                href={'/projects'}
                className={`flex items-center gap-3 px-6 py-2 text-base font-medium rounded-full transition-all duration-200 ${
                  pathname === '/projects'
                    ? 'bg-white/60 text-prussian font-semibold shadow-lg'
                    : 'text-prussian/70 hover:text-prussian hover:bg-white/30'
                }`}
              >
                <Scroll size={18} strokeWidth={2.5} />
                Projekte
              </Link>
            </div>

            {/* LOGIN/LOGOUT & NOTIFICATION ICON & GREETING */}
            <div className='absolute right-0 flex items-center gap-2 lg:gap-3'>
              {/* GREETING */}
              {isAuthenticated && !showLoadingState && (
                <Link href={'/profile'} className='flex items-center gap-x-2'>
                  {user?.image && (
                    <div className='relative size-10 rounded-full overflow-hidden'>
                      <Image
                        src={user?.image ?? '/fallback.png'}
                        alt={`${displayName} profile image`}
                        fill
                        className='object-cover'
                      />
                    </div>
                  )}
                </Link>
              )}
              {/* NOTIFICATION BELL - only show when authenticated */}
              {isAuthenticated && !showLoadingState && user && (
                <NotificationBell user={user} />
              )}
              {/* LOGIN/LOGOUT BUTTON */}
              <button
                onClick={handleAuthToggle}
                disabled={showLoadingState}
                className={`flex hover:cursor-pointer space-x-2 items-center px-2 py-2 text-sm lg:text-base font-medium rounded-full bg-light-mint/90 text-prussian hover:bg-light-mint transition-all duration-200 shadow-md hover:shadow-lg ${
                  !isAuthenticated ? 'gap-2 px-2 lg:px-4' : ''
                } ${showLoadingState ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {showLoadingState ? (
                  // Show loading state during hydration or auth operations
                  <>
                    <div className='w-4 h-4 border-2 border-prussian/30 border-t-prussian rounded-full animate-spin' />
                    <span className='hidden sm:inline'>Loading...</span>
                  </>
                ) : isAuthenticated ? (
                  <>
                    <LogOut size={16} strokeWidth={2.5} />
                    <span className='hidden sm:inline'>Logout</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} strokeWidth={2.5} />
                    <span className='hidden sm:inline'>Login</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className='xl:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50'>
        <div className='flex items-center bg-light-mint/90 backdrop-blur-xl rounded-full px-2 py-2 shadow-xl gap-3'>
          <Link
            href={'/'}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              pathname === '/'
                ? 'bg-white/60 text-prussian shadow-lg'
                : 'text-prussian/70 hover:text-prussian hover:bg-white/30'
            }`}
          >
            <House size={18} strokeWidth={2.5} />
          </Link>
          <Link
            href={'/dashboard'}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              pathname === '/dashboard'
                ? 'bg-white/60 text-prussian shadow-lg'
                : 'text-prussian/70 hover:text-prussian hover:bg-white/30'
            }`}
          >
            <LayoutDashboard size={18} strokeWidth={2.5} />
          </Link>
          <Link
            href={'/projects'}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              pathname === '/projects'
                ? 'bg-white/60 text-prussian shadow-lg'
                : 'text-prussian/70 hover:text-prussian hover:bg-white/30'
            }`}
          >
            <Scroll size={18} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default Header;
