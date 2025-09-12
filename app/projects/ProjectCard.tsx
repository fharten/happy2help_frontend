import { Project } from '@/types/project.d';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Link as LucideLink } from 'lucide-react';
import { Calendar, Building2 } from 'lucide-react';

interface ProjectProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectProps) {
  const availableImages = ['project1_img1.jpg', 'project1_img2.jpg'];

  const getImageSrc = () => {
    if (project.images.length > 0 && project.images[0]) {
      const requestedImage = project.images[0];
      if (availableImages.includes(requestedImage)) {
        return `/images/projects/${requestedImage}`;
      }
    }
    return '/images/fallback.png';
  };

  const categoryNames = project.categories.slice(0, 3).map((cat) => cat.name);

  return (
    <Card className='w-full bg-light-mint/10 backdrop-blur-xl border-0 shadow-2xl rounded-[2rem] transition-all duration-200 hover:scale-[1.01] hover:shadow-3xl hover:bg-light-mint/15 py-0'>
      <div className='flex flex-col md:grid md:grid-cols-2 lg:gap-6 md:gap-8 items-stretch'>
        {/* Bild */}
        <div className='flex justify-center w-full md:order-2 order-1'>
          <div className='w-full aspect-[4/3]'>
            <Image
              className='w-full h-full object-cover rounded-t-[1.5rem] lg:rounded-tl-[0rem] lg:rounded-r-[1.5rem] shadow-lg'
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
              <div className='flex flex-row items-start justify-between gap-3'>
                <Link
                  href={`/projects/${project.id}`}
                  className='flex-1 min-w-0 group'
                >
                  <CardTitle className='text-xl lg:text-2xl font-bold text-prussian group-hover:text-prussian/80 transition-colors duration-200 mb-2 leading-tight'>
                    {project.name}
                  </CardTitle>
                </Link>
                <Link
                  href={`/ngos/${project.ngo.id}`}
                  className='inline-flex items-center gap-1.5 text-prussian/70 hover:text-prussian group transition-colors text-sm font-medium whitespace-nowrap bg-white/60 px-3 py-1.5 rounded-full'
                >
                  <LucideLink
                    size={12}
                    className='group-hover:opacity-100 transition-opacity duration-200'
                  />
                  <span className='group-hover:opacity-100 transition-opacity duration-200 truncate max-w-[120px]'>
                    {project.ngo.name}
                  </span>
                </Link>
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
                    ? new Date(project.startingAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : ''}
                </span>
              </div>

              {/* Description */}
              <div className='hidden md:block'>
                <CardDescription className='text-base text-prussian/70 leading-relaxed font-medium'>
                  {project.description.length > 160
                    ? project.description.substring(0, 157) + '...'
                    : project.description}
                </CardDescription>
              </div>
            </CardHeader>
          </div>

          {/* Categories */}
          <div className='flex flex-wrap gap-2 mt-auto'>
            {categoryNames.length > 0 ? (
              categoryNames.map((name, index) => (
                <Badge
                  key={name + index}
                  className='bg-light-mint/20 text-prussian border-light-mint/30 hover:bg-light-mint/30 px-3 py-1 text-xs font-medium rounded-full'
                >
                  {name}
                </Badge>
              ))
            ) : (
              <Badge className='bg-light-mint/20 text-prussian border-light-mint/30 hover:bg-light-mint/30 px-3 py-1 text-xs font-medium rounded-full'>
                Keine Kategorie
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}