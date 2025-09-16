'use client';

import useSWR from 'swr';
import NgoProjectsTable from './NgoProjectsTable';
import NgoProjectsApplicationsTable from './NgoProjectsApplicationsTable';
import DashboardBar from './DashboardBar';
import { Projects } from '@/types/project';
import { Applications } from '@/types/application';
import { useAuth } from '@/contexts/AuthContext';
import { swrFetcher } from '@/contexts/AuthContext';

const NgoDashboard = () => {
  const { user } = useAuth();
  const ngoId = user?.id;

  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    isValidating: isValidatingProjects,
    error: errorProjects,
  } = useSWR<{
    projects: Projects;
  }>(
    ngoId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}/projects?includeStats=true`
      : null,
    swrFetcher,
  );

  const {
    data: applicationsData,
    isLoading: isLoadingApplications,
    isValidating: isValidatingApplications,
    error: errorApplications,
  } = useSWR<{
    applications: Applications;
  }>(
    ngoId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}/applications`
      : null,
    swrFetcher,
  );

  if (!user || !ngoId || isLoadingProjects || isLoadingApplications) {
    return <div>Lade...</div>;
  }

  if (errorProjects || errorApplications) {
    return (
      <div>
        Fehler:{' '}
        {errorProjects ? errorProjects.message : errorApplications?.message}
      </div>
    );
  }

  if (!projectsData || !applicationsData) {
    return <div>Lade...</div>;
  }

  return (
    <>
      <DashboardBar />
      <div className='container-site rounded-2xl'>
        <div className='py-4 flex flex-col gap-4'>
          <NgoProjectsTable projects={projectsData.projects} />
          <NgoProjectsApplicationsTable
            applications={applicationsData.applications}
          />
        </div>
      </div>

      {(isValidatingProjects || isValidatingApplications) && (
        <span className='ml-4 text-gray-400'>Lädt neu...</span>
      )}
    </>
  );
};

export default NgoDashboard;
