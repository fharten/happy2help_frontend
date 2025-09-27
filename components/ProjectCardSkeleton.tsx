import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function ProjectCardSkeleton() {
  return (
    <Card className='w-full bg-light-mint/10 backdrop-blur-xl border-0 shadow-2xl rounded-[2rem] py-0'>
      <div className='flex flex-col md:grid md:grid-cols-2 items-stretch'>
        {/* Bild */}
        <div className='flex justify-center w-full md:order-2 order-1'>
          <div className='w-full aspect-[4/3]'>
            <Skeleton className='w-full h-full rounded-t-[2rem] rounded-b-[unset] md:rounded-r-[2rem] md:rounded-l-[unset] bg-gray-400' />
          </div>
        </div>

        {/* Content */}
        <div className='flex flex-col justify-between h-full p-6 md:p-8 md:order-1 order-2'>
          {/* Header */}
          <div>
            <div className='p-0 mb-4 lg:mb-6'>
              {/* Desktop Layout */}
              <div className='hidden lg:flex lg:flex-row lg:items-center lg:justify-between mb-4 md:mb-6'>
                {/* Projekt Title */}
                <Skeleton className='h-[32px] w-[200px] rounded bg-gray-400' />{' '}
                {/* NGO Button */}
                <Skeleton className='h-[32px] w-[120px] rounded bg-gray-400' />{' '}
              </div>

              {/* Mobile Layout */}
              <div className='lg:hidden'>
                <div className='mb-3'>
                  {/* Projekt Title Mobile */}
                  <Skeleton className='h-[32px] w-[180px] rounded mb-2 bg-gray-400' />{' '}
                </div>
                <div className='mb-4'>
                  {/* NGO Button Mobile */}
                  <Skeleton className='h-[32px] w-[100px] rounded bg-gray-400' />{' '}
                </div>
              </div>

              {/* Location & Date */}
              <div className='flex flex-wrap items-center gap-4 mb-4 md:mb-6'>
                {/* Location */}
                <Skeleton className='h-[16px] w-[80px] rounded bg-gray-400' />{' '}
                {/* Date */}
                <Skeleton className='h-[16px] w-[90px] rounded bg-gray-400' />{' '}
              </div>

              {/* Description */}
              <div className='hidden md:block'>
                <Skeleton className='h-[16px] w-full rounded mb-2 bg-gray-400' />
                <Skeleton className='h-[16px] w-[85%] rounded mb-2 bg-gray-400' />
                <Skeleton className='h-[16px] w-[70%] rounded bg-gray-400' />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className='flex flex-wrap gap-2 mt-auto'>
            <Skeleton className='h-[24px] w-[80px] rounded-full bg-gray-400' />
            <Skeleton className='h-[24px] w-[90px] rounded-full bg-gray-400' />
            <Skeleton className='h-[24px] w-[70px] rounded-full bg-gray-400' />
          </div>
        </div>
      </div>
    </Card>
  );
}
