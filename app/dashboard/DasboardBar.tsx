'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const DashboardBar = () => {
  const [themeIsDark, setThemeIsDark] = useState(false);
  const router = useRouter();

  return (
    <div className='flex items-center justify-between m-4'>
      <Button
        onClick={() => router.push('/profile')}
        className='hover:cursor-pointer'
      >
        Edit Profile
      </Button>
      <Button
        onClick={() => setThemeIsDark(!themeIsDark)}
        className='hover:cursor-pointer'
      >
        {themeIsDark ? <Moon /> : <Sun />}
      </Button>
    </div>
  );
};

export default DashboardBar;
