'use client';

import { useParams, usePathname } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, User, Zap, ArrowLeft } from 'lucide-react';
import { Project } from '@/types/project.d';
import { Skill } from '@/types/skill.d';
import ButtonComponent from '@/components/ButtonComponent';
import BadgeComponent from '@/components/BadgeComponent';
import { swrFetcher, useAuth } from '@/contexts/AuthContext';
import ApplyButton from './ApplyButton';
import { getUserEntityType } from '@/lib/user-utils';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user: userLoggedIn, isLoading: userLoggedInLoading } = useAuth();
  const pathname = usePathname();
  const parentUrl = pathname?.split('/').slice(0, -1).join('/') || '/';

  const fetcher = async (url: string | URL | Request) => {
    const response = await fetch(url);
    const json = await response.json();
    return json.data; // Extract just the data property
  };

  const {
    data: project,
    isLoading,
    isValidating,
    error,
  } = useSWR<Project>(
    id ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${id}` : null,
    fetcher
  );

  const {
    data,
    isLoading: isLoadingHasApplied,
    error: errorHasApplied,
  } = useSWR<{
    hasApplied: boolean;
    application: unknown;
  }>(
    !userLoggedInLoading && userLoggedIn && id
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/applications/check/${userLoggedIn.id}/${id}`
      : null,
    swrFetcher
  );

  // get user if logged in
  const { user, isLoading: isUserLoading } = useAuth();
  let entityType = 'unknown';
  if (user) entityType = getUserEntityType(user!);

  if (isLoading || isUserLoading || !project) {
    return (
      <div className='container-site'>
        <div className='bg-light-mint/10 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 text-center'>
          <div className='text-prussian font-medium'>Lade Projekt...</div>
        </div>
      </div>
    );
  }
  if (error)
    return (
      <div className='container-site'>
        <div className='bg-red-50/80 backdrop-blur-xl rounded-[2rem] p-8 lg:p-10 text-center border border-red-200'>
          <div className='text-red-700 font-medium'>
            Fehler beim Laden: {error.message}
          </div>
        </div>
      </div>
    );

  return (
    <div className='container-site'>
      {/* Back Button */}
      <div className='mb-6'>
        <Link href={parentUrl}>
          <ButtonComponent
            variant='secondary'
            size='sm'
            className='flex items-center gap-2 bg-light-mint/20 border border-light-mint/30 text-prussian hover:bg-light-mint/30 hover:border-light-mint/40 transition-all duration-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md'
          >
            <ArrowLeft size={16} />
            <span className='font-medium'>Zurück zur Übersicht</span>
          </ButtonComponent>
        </Link>
      </div>

      {/* Image Carousel */}
      <div className='mb-8'>
        <Carousel className='w-full rounded-2xl overflow-hidden h-[250px] lg:h-[500px] shadow-xl bg-gray-100'>
          <CarouselContent className='h-[250px] lg:h-[500px]'>
            {project.images && project.images.length > 0 ? (
              project.images.map((image: string, index: number) => (
                <CarouselItem key={index} className='h-full'>
                  <Image
                    src={image}
                    alt={`Projektbild ${index + 1}`}
                    width={1200}
                    height={600}
                    className='w-full h-full object-cover'
                    sizes='(max-width: 640px) 100vw, 1200px'
                    priority={index === 0}
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://raw.githubusercontent.com/fharten/happy2help_frontend/refs/heads/main/public/images/h2h_logo_mint.png';
                    }}
                  />
                </CarouselItem>
              ))
            ) : (
              <CarouselItem className='h-full'>
                <div className='w-full h-full min-h-[300px] lg:min-h-[400px] flex items-center justify-center bg-gradient-to-br from-light-mint/20 to-light-mint/10 text-prussian/60'>
                  <div className='text-center'>
                    <div className='text-lg font-medium mb-2'>
                      Keine Bilder vorhanden
                    </div>
                    <div className='text-sm'>
                      Für dieses Projekt wurden noch keine Bilder hochgeladen
                    </div>
                  </div>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          {project.images && project.images.length > 1 && (
            <>
              <CarouselPrevious className='left-4 bg-white/90 hover:bg-white border-light-mint/30 hover:border-light-mint/50 shadow-lg hover:shadow-xl transition-all duration-200' />
              <CarouselNext className='right-4 bg-white/90 hover:bg-white border-light-mint/30 hover:border-light-mint/50 shadow-lg hover:shadow-xl transition-all duration-200' />
            </>
          )}
        </Carousel>
      </div>

      {/* Project Header */}
      <div className='mb-8'>
        <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4'>
          <div className='flex-1'>
            {/* Title with Badge */}
            <div className='flex flex-col  gap-3 mb-3'>
              <h1 className='text-2xl lg:text-4xl font-bold text-prussian tracking-tight leading-tight'>
                {project.name}
              </h1>
              <h2 className='text-l lg:text-2xl font-bold text-prussian tracking-tight leading-tight'>
                <Link key={project.ngo.id} href={`/ngos/${project.ngo.id}`}>
                  {project.ngo.name}
                </Link>
              </h2>
              <BadgeComponent
                variant={project.isActive ? 'success' : 'warning'}
                size='md'
                className='inline-flex items-center gap-2 px-4 py-2 text-sm font-medium self-start'
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    project.isActive ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                />
                {project.isActive ? 'Aktiv' : 'Abgeschlossen'}
              </BadgeComponent>
            </div>
          </div>

          {/* Action Button - show only if user has logged in*/}
          <div className='lg:mt-0 mt-4'>
            {user &&
              entityType === 'user' &&
              !isLoadingHasApplied &&
              !errorHasApplied &&
              !data?.hasApplied && (
                <ApplyButton projectId={project.id}>Jetzt bewerben</ApplyButton>
              )}
            {!isLoadingHasApplied && data?.hasApplied && (
              <ButtonComponent
                variant='danger'
                className='w-full lg:w-auto hover:cursor-not-allowed'
              >
                Bereits beworben
              </ButtonComponent>
            )}
          </div>
        </div>

        {/* Description */}
        <div className='bg-light-mint/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-6 border border-light-mint/20'>
          <p className='text-base lg:text-lg text-prussian/80 leading-relaxed font-medium'>
            {project.description}
          </p>
        </div>
      </div>

      {/* Project Details Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        {/* Left Column */}
        <div className='bg-light-mint/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-light-mint/20'>
          <h3 className='text-lg font-bold text-prussian mb-4 flex items-center gap-2'>
            <Calendar size={20} className='text-light-mint' />
            Zeitraum & Ort
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-prussian/70 font-medium'>Start:</span>
              <span className='text-prussian font-semibold'>
                {new Date(project.startingAt).toLocaleDateString('de-DE')}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-prussian/70 font-medium'>Ende:</span>
              <span className='text-prussian font-semibold'>
                {new Date(project.endingAt).toLocaleDateString('de-DE')}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-prussian/70 font-medium'>Stadt:</span>
              <span className='text-prussian font-semibold flex items-center gap-1'>
                <MapPin size={14} />
                {project.city}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-prussian/70 font-medium'>PLZ:</span>
              <span className='text-prussian font-semibold'>
                {project.zipCode}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-prussian/70 font-medium'>Bundesland:</span>
              <span className='text-prussian font-semibold'>
                {project.state}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className='bg-light-mint/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-light-mint/20'>
          <h3 className='text-lg font-bold text-prussian mb-4 flex items-center gap-2'>
            <User size={20} className='text-light-mint' />
            Ansprechpartner & Details
          </h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-prussian/70 font-medium'>Verein:</span>
              <span className='text-prussian font-semibold'>
                <Link key={project.ngo.id} href={`/ngos/${project.ngo.id}`}>
                  {project.ngo.name}
                </Link>
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-prussian/70 font-medium'>
                Ansprechpartner:
              </span>
              <span className='text-prussian font-semibold'>
                {project.principal}
              </span>
            </div>
            {project.compensation && (
              <div className='flex items-center justify-between'>
                <span className='text-prussian/70 font-medium'>
                  Aufwandsentschädigung:
                </span>
                <span className='text-prussian font-semibold flex items-center gap-1'>
                  {project.compensation}
                </span>
              </div>
            )}
            <div className='pt-2 border-t border-light-mint/20'>
              <span className='text-prussian/70 font-medium block mb-2'>
                Kategorien:
              </span>
              <div className='flex flex-wrap gap-2'>
                {project.categories.map((category) => (
                  <BadgeComponent
                    key={category.id}
                    variant='category'
                    size='sm'
                  >
                    {category.name}
                  </BadgeComponent>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      {project.skills && project.skills.length > 0 && (
        <div className='bg-light-mint/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-light-mint/20 mb-8'>
          <h3 className='text-lg font-bold text-prussian mb-4 flex items-center gap-2'>
            <Zap size={20} className='text-light-mint' />
            Gesuchte Fähigkeiten
          </h3>
          <div className='flex flex-wrap gap-2'>
            {project.skills.map((skill: Skill) => (
              <BadgeComponent key={skill.id} variant='skill' size='sm'>
                {skill.name}
              </BadgeComponent>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isValidating && (
        <div className='text-center'>
          <div className='inline-flex items-center gap-2 text-prussian/60 font-medium'>
            <div className='w-4 h-4 border-2 border-light-mint border-t-transparent rounded-full animate-spin'></div>
            Aktualisiere Daten...
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
