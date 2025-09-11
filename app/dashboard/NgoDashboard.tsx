'use client';

import useSWR from 'swr';
import NgoProjectsTable from './NgoProjectsTable';
import NgoProjectsApplicationsTable from './NgoProjectsApplicationsTable';
import DashboardBar from './DashboardBar';
import { Projects } from '@/types/project';
import { Applications } from '@/types/application';
import { authenticatedFetcher, getUserId, isAuthenticated } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const NgoDashboard = () => {
  const [ngoId, setNgoId] = useState<string | null>(null);
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

    setNgoId(id);
  }, [router]);

  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    isValidating: isValidatingProjects,
    error: errorProjects,
  } = useSWR<{
    data: { projects: Projects };
  }>(
    ngoId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}/projects?includeStats=true`
      : null,
    authenticatedFetcher
  );

  const {
    data: applicationsData,
    isLoading: isLoadingApplications,
    isValidating: isValidatingApplications,
    error: errorApplications,
  } = useSWR<{
    data: { applications: Applications };
  }>(
    ngoId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/ngos/${ngoId}/applications`
      : null,
    authenticatedFetcher
  );

  if (!ngoId) return <div>Lade...</div>;
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
