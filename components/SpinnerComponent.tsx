'use client';

import { Spinner } from '@/components/ui/shadcn-io/spinner';

const SpinnerComponent = () => (
  <div className='flex items-center justify-center h-[40vh]'>
    <Spinner variant='ellipsis' className='text-mint' size={48} />
  </div>
);

export default SpinnerComponent;
