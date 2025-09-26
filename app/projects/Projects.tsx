'use client';

import useSWR from 'swr';
import ProjectCard from './ProjectCard';
import { Project } from '@/types/project.d';
import { Skeleton } from '@/components/ui/skeleton';
import ProjectCardSkeleton from '@/components/ProjectCardSkeleton';

// Fetcher function

const fetcher = async (url: string | URL | Request) => {
  const response = await fetch(url);
  const json = await response.json();
  return json.data;
};

export default function Projects() {
  const {
    data: projects,
    error,
    isLoading,
  } = useSWR(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects`, fetcher);

  if (isLoading)
    return (
      <div className='w-full'>
        <div className='mb-8'>
          <h1 className='text-2xl lg:text-3xl font-bold text-prussian mb-3 tracking-tight'>
            Alle Projekte
          </h1>
          <p className='text-prussian/70 text-sm lg:text-base font-medium'>
            Entdecke spannende Projekte und finde dein nächstes ehrenamtliches
            Engagement.
          </p>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <ProjectCardSkeleton />;
          </div>
        ))}
      </div>
    );

  if (error)
    return (
      <div className='container-site'>
        <div className='bg-red-50/80 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 text-center border border-red-200'>
          <div className='text-red-700 font-medium'>
            Fehler beim Laden der Projekte
          </div>
        </div>
      </div>
    );

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-2xl lg:text-3xl font-bold text-prussian mb-3 tracking-tight'>
          Alle Projekte
        </h1>
        <p className='text-prussian/70 text-sm lg:text-base font-medium'>
          Entdecke spannende Projekte und finde dein nächstes ehrenamtliches
          Engagement.
        </p>
      </div>

      {!projects || projects.length === 0 ? (
        <div className='bg-light-mint/10 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 text-center'>
          <div className='text-prussian/70 text-lg font-medium opacity-80'>
            Keine Projekte vorhanden
          </div>
          <div className='text-prussian/60 text-sm mt-2'>
            Es wurden noch keine Projekte veröffentlicht.
          </div>
        </div>
      ) : (
        <ul className='flex flex-col gap-6'>
          {projects.map((project: Project) => (
            <li key={project.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
