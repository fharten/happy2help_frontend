'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/lib/auth';

const DashboardBar = () => {
  const [themeIsDark, setThemeIsDark] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className='flex items-center justify-between m-4'>
      <Button
        onClick={() => router.push('/profile')}
        className='hover:cursor-pointer'
      >
        Edit Profile
      </Button>
      <div className='flex gap-2'>
        <Button
          onClick={() => setThemeIsDark(!themeIsDark)}
          className='hover:cursor-pointer'
        >
          {themeIsDark ? <Moon /> : <Sun />}
        </Button>
        <Button
          onClick={handleLogout}
          variant='outline'
          className='hover:cursor-pointer'
        >
          <LogOut className='w-4 h-4 mr-2' />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardBar;
