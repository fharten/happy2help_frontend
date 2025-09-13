'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  House,
  LayoutDashboard,
  Pencil,
  Scroll,
  LogIn,
  LogOut,
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { getUserDisplayName } from '@/lib/user-utils';

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('Account');
  const [isHydrated, setIsHydrated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<string | null>(null);

  /**
   *  Einmaliges laden der Daten aus dem localStorage nach der hydration
   *  durch setIsHydrated(true) wird signalisiert das der Client bereit ist
   */
  useEffect(() => {
    setAuthToken(localStorage.getItem('authToken'));
    setUserId(localStorage.getItem('userId'));
    setUserType(localStorage.getItem('userType'));
    setUserSession(localStorage.getItem('user-session'));
    setIsHydrated(true);
  }, []);

  // Listen to localStorage changes (e.g., after login)
  useEffect(() => {
    if (!isHydrated) return;

    // Hier werden alle localStorage states aktualisiert
    const handleStorageChange = () => {
      setAuthToken(localStorage.getItem('authToken'));
      setUserId(localStorage.getItem('userId'));
      setUserType(localStorage.getItem('userType'));
      setUserSession(localStorage.getItem('user-session'));
    };

    // Damit achten wir auch auf storage events in anderen tabs/fenstern
    window.addEventListener('storage', handleStorageChange);

    // Prüft jede Sekunde auf Änderungen im selben Tab
    const interval = setInterval(() => {
      const currentAuthToken = localStorage.getItem('authToken');
      const currentUserId = localStorage.getItem('userId');
      const currentUserSession = localStorage.getItem('user-session');

      if (
        currentAuthToken !== authToken ||
        currentUserId !== userId ||
        currentUserSession !== userSession
      ) {
        handleStorageChange();
      }
    }, 1000);

    // Wichtige cleanup-funktion für EventListener und Intervall
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isHydrated, authToken, userId, userSession]);

  /**
   * Hier wird entweder AuthContext
   * Oder alternativ localStorage-basierte Authentifizierung (nach hydration) genutzt
   * Also entweder hydriert + authenfiziert ODER hydriert und authToken + userId sind vorhanden
   */
  const isLoggedIn = isHydrated && (isAuthenticated || !!(authToken && userId));

  /**
   * hook rerendert wenn:
   * - user einloggt/ausloggt,
   * - AuthContext sich ändert,
   * - andere userId geladen wird,
   * - userType wechselt
   * - oder bei neuem authToken
   */
  useEffect(() => {
    const loadUserName = async () => {
      if (!isLoggedIn) {
        setDisplayName('Account');
        return;
      }

      try {
        const displayName = await getUserDisplayName({
          user: user || undefined,
          userId,
          userType,
          authToken,
        });
        setDisplayName(displayName);
      } catch (error) {
        console.warn('Error loading user display name:', error);
        setDisplayName('Account');
      }
    };

    loadUserName();
  }, [isLoggedIn, user, userId, userType, authToken]);

  const handleAuthToggle = () => {
    if (isLoggedIn) {
      if (isAuthenticated && logout) {
        logout();
      } else {
        // clear localeStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('user-session');
        localStorage.removeItem('task-tango-storage');

        // clear state
        setAuthToken(null);
        setUserId(null);
        setUserType(null);
        setUserSession(null);
        setDisplayName('Account');

        router.push('/');

        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } else {
      router.push('/login');
    }
  };

  const getDisplayName = () => {
    return displayName;
  };
  return (
    <>
      {/* DESKTOP & MOBILE TOP BAR */}
      <header className='bg-white pt-4 pb-3 lg:pt-6 lg:pb-4'>
        <nav aria-label='Main navigation' className='px-4 lg:px-8'>
          <div className='flex justify-between items-center'>
            {/* LOGO TEXT */}
            <div className='flex items-center gap-3 lg:gap-6'>
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
                href={'/projects/edit'}
                className={`flex items-center gap-3 px-6 py-2 text-base font-medium rounded-full transition-all duration-200 ${
                  pathname.startsWith('/projects/edit')
                    ? 'bg-white/60 text-prussian font-semibold shadow-lg'
                    : 'text-prussian/70 hover:text-prussian hover:bg-white/30'
                }`}
              >
                <Pencil size={18} strokeWidth={2.5} />
                Edit Project
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
                Projects
              </Link>
            </div>

            {/* LOGIN/LOGOUT & NOTIFICATION ICON & GREETING */}
            <div className='flex items-center gap-2 lg:gap-3'>
              {/* GREETING */}
              {isHydrated && isLoggedIn && (
                <span className='hidden md:inline text-sm text-prussian font-medium'>
                  Hallo, {getDisplayName()}
                </span>
              )}

              <NotificationBell userId='19398e16-283e-408e-8c1b-460979cd6856' />

              {/* LOGIN/LOGOUT BUTTON */}
              <button
                onClick={handleAuthToggle}
                className={`flex items-center px-2 py-2 text-sm lg:text-base font-medium rounded-full bg-light-mint/90 text-prussian hover:bg-light-mint transition-all duration-200 shadow-md hover:shadow-lg ${
                  !isLoggedIn ? 'gap-2 px-2 lg:px-4' : ''
                }`}
              >
                {!isHydrated ? (
                  // Show loading state during hydration
                  <>
                    <LogIn size={16} strokeWidth={2.5} />
                    <span className='hidden sm:inline'>Login</span>
                  </>
                ) : isLoggedIn ? (
                  <>
                    <LogOut size={16} strokeWidth={2.5} />
                    <span className='hidden sm:inline'></span>
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
            href={'/projects/edit'}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              pathname.startsWith('/projects/edit')
                ? 'bg-white/60 text-prussian shadow-lg'
                : 'text-prussian/70 hover:text-prussian hover:bg-white/30'
            }`}
          >
            <Pencil size={18} strokeWidth={2.5} />
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
