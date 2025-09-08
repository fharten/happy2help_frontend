'use client';

import useSWR from 'swr';
import NgoProjectsTable from './NgoProjectsTable';
import NgoProjectsApplicationsTable from './NgoProjectsApplicationsTable';
import DashboardBar from './DashboardBar';
import { Projects } from '@/types/project';
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

const NgoDashboard = ({ ngoId }: { ngoId: string }) => {
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    isValidating: isValidatingProjects,
    error: errorProjects,
  } = useSWR<{
    data: { projects: Projects };
  }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}/projects?includeStats=true`,
    fetcher,
  );

  const {
    data: applicationsData,
    isLoading: isLoadingApplications,
    isValidating: isValidatingApplications,
    error: errorApplications,
  } = useSWR<{
    data: { applications: Applications };
  }>(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}/applications`,
    fetcher,
  );

  if (
    isLoadingProjects ||
    isLoadingApplications ||
    !projectsData ||
    !applicationsData
  )
    return <div>Lade...</div>;
  if (errorProjects || errorApplications)
    return (
      <div>
        Fehler:{' '}
        {errorProjects ? errorProjects.message : errorApplications.message}
      </div>
    );

  return (
    <>
      <DashboardBar />
      <NgoProjectsTable projects={projectsData.data.projects} />
      <NgoProjectsApplicationsTable
        applications={applicationsData.data.applications}
      />
      {isValidatingProjects ||
        (isValidatingApplications && (
          <span className='ml-4 text-gray-400'>Lädt neu...</span>
        ))}
    </>
  );
};

export default NgoDashboard;
