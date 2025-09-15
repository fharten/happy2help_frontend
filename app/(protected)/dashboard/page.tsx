'use client';

import NgoDashboard from './NgoDashboard';
import UserDashboard from './UserDashboard';
import { useEffect, useState } from 'react';
import { getUserType, isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
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

  return <>{userType === 'users' ? <UserDashboard /> : <NgoDashboard />}</>;
};

export default DashboardPage;
