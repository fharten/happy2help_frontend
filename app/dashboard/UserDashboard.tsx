'use client';

import useSWR from 'swr';
import DashboardBar from './DasboardBar';
import UserProjectsApplicationsTable from './UserProjectsApplicationsTable';
import { Applications } from '@/types/application';
import { authenticatedFetcher, getUserId, isAuthenticated } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const UserDashboard = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const id = getUserId();
    if (!id) {
      router.push('/login');
      return;
    }

    setUserId(id);
  }, [router]);

  const { data, isLoading, isValidating, error } = useSWR<{
    data: { applications: Applications };
  }>(
    userId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/applications`
      : null,
    authenticatedFetcher
  );

  if (!userId) return <div>Lade...</div>;
  if (isLoading || !data) return <div>Lade...</div>;
  if (error) return <div>Fehler: {error.message}</div>;

  return (
    <>
      <DashboardBar />
      <UserProjectsApplicationsTable applications={data.data.applications} />

      {isValidating && <span className='ml-4 text-gray-400'>Lädt neu...</span>}
    </>
  );
};

export default UserDashboard;
