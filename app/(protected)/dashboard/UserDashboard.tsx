'use client';

import useSWR from 'swr';
import DashboardBar from './DashboardBar';
import UserProjectsApplicationsTable from './UserProjectsApplicationsTable';
import { Applications } from '@/types/application';
import { swrFetcher, useAuth } from '@/contexts/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const { data, isLoading, isValidating, error } = useSWR<{
    applications: Applications;
  }>(
    userId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/applications`
      : null,
    swrFetcher,
  );

  if (!user || !userId || isLoading) {
    return <div>Lade...</div>;
  }

  if (error) {
    return <div>Fehler: {error.message}</div>;
  }

  if (!data) {
    return <div>Lade...</div>;
  }

  return (
    <>
      <DashboardBar />
      <div className='container-site rounded-2xl'>
        <div className='py-4 px-4 flex flex-col gap-4'>
          <UserProjectsApplicationsTable applications={data.applications} />
        </div>
      </div>

      {isValidating && <span className='ml-4 text-gray-400'>Lädt neu...</span>}
    </>
  );
};

export default UserDashboard;
