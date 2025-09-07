'use client';

import useSWR from 'swr';
import DashboardBar from './DasboardBar';
import { Projects } from '@/types/project';
import UserProjectsApplicationsTable from './UserProjectsApplicationsTable';
import { Applications } from '@/types/application';

type FetchError = Error & { info?: unknown; status?: number };

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error: FetchError = new Error(
      'An error occurred while fetching the data.',
    );
    try {
      error.info = await res.json();
    } catch {}
    error.status = res.status;
    throw error;
  }
  return res.json();
};

const NgoDashboard = ({ userId }: { userId: string }) => {
  const { data, isLoading, isValidating, error } = useSWR<{
    data: { applications: Applications };
  }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}/applications`,
    fetcher,
  );

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

export default NgoDashboard;
