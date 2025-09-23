import { Project } from '@/types/project.d';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Building2 } from 'lucide-react';
import BadgeComponent from '@/components/BadgeComponent';
import ButtonComponent from '@/components/ButtonComponent';

interface ProjectProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectProps) {
  const getImageSrc = () => {
    if (project.images.length > 0 && project.images[0]) {
      return project.images[0];
    }
    return '/images/fallback.png';
  };

  const categoryNames = project.categories.slice(0, 3).map((cat) => cat.name);

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className='w-full bg-light-mint/10 backdrop-blur-xl border-0 shadow-2xl rounded-[2rem] transition-all duration-200 hover:scale-[1.01] hover:shadow-3xl py-0'>
        <div className='flex flex-col md:grid md:grid-cols-2 items-stretch'>
          {/* Bild */}
          <div className='flex justify-center w-full md:order-2 order-1'>
            <div className='w-full aspect-[4/3]'>
              <Image
                className='w-full h-full object-cover rounded-t-[1.5rem] md:rounded-tl-[0rem] md:rounded-r-[2rem] shadow-lg'
                src={getImageSrc()}
                alt={`Bild vom Projekt ${project.name}`}
                width={500}
                height={320}
                sizes='(max-width: 640px) 100vw, 900px'
              />
            </div>
          </div>

          {/* Content */}
          <div className='flex flex-col justify-between h-full p-6 md:p-8 md:order-1 order-2'>
            {/* Header */}
            <div>
              <CardHeader className='p-0 mb-4 lg:mb-6'>
                {/* Desktop Layout */}
                <div className='hidden lg:flex lg:flex-row lg:items-start lg:gap-3 mb-4'>
                  <CardTitle className='text-xl lg:text-2xl font-bold text-prussian group-hover:text-prussian/80 transition-colors duration-200 mb-2 leading-tight line-clamp-2 pr-2 break-words'>
                    {project.name}
                  </CardTitle>
                  <div>
                    <ButtonComponent
                      variant='plain'
                      size='sm'
                      className='w-full'
                    >
                      <span className='truncate'>{project.ngo.name}</span>
                    </ButtonComponent>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className='lg:hidden'>
                  <div className='mb-3'>
                    <CardTitle className='text-xl font-bold text-prussian group-hover:text-prussian/80 transition-colors duration-200 leading-tight line-clamp-3'>
                      {project.name}
                    </CardTitle>
                  </div>
                  <div className='mb-4'>
                    <ButtonComponent variant='plain' size='sm'>
                      <span className='truncate'>{project.ngo.name}</span>
                    </ButtonComponent>
                  </div>
                </div>

                {/* Location & Date */}
                <div className='flex flex-wrap items-center gap-4 text-sm text-prussian/60 font-medium mb-4'>
                  <span className='flex items-center gap-1.5'>
                    <Building2 size={14} className='text-light-mint' />
                    {project.city}
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <Calendar size={14} className='text-light-mint' />
                    {project.startingAt
                      ? new Date(project.startingAt).toLocaleDateString(
                          'de-DE',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          }
                        )
                      : ''}
                  </span>
                </div>

                {/* Description */}
                <div className='hidden md:block'>
                  <CardDescription className='text-base text-prussian/70 leading-relaxed font-medium break-words hyphens-auto overflow-hidden'>
                    <p className='hyphenate'>
                      {project.description.length > 160
                        ? project.description.substring(0, 157) + '...'
                        : project.description}
                    </p>
                  </CardDescription>
                </div>
              </CardHeader>
            </div>

            {/* Categories */}
            <div className='flex flex-wrap gap-2 mt-auto'>
              {categoryNames.length > 0 ? (
                categoryNames.map((name, index) => (
                  <BadgeComponent
                    key={name + index}
                    variant='category'
                    size='sm'
                    className='bg-light-mint/20 text-prussian border-light-mint/30 hover:bg-light-mint/30'
                  >
                    {name}
                  </BadgeComponent>
                ))
              ) : (
                <BadgeComponent
                  variant='category'
                  size='sm'
                  className='bg-light-mint/20 text-prussian border-light-mint/30 hover:bg-light-mint/30'
                >
                  Keine Kategorie
                </BadgeComponent>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
