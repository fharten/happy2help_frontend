import { cn } from '@/lib/utils';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BadgeComponent from '@/components/BadgeComponent';
import LoginFormCard from './LoginFormCard';
import ButtonComponent from '@/components/ButtonComponent';

const LoginForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Tabs defaultValue='users'>
        <TabsList className='flex gap-2'>
          <TabsTrigger value='users' asChild>
            <ButtonComponent
              variant='primary'
              size='md'
              type='submit'
              className='w-full data-[state=active]:bg-light-mint/20 data-[state=active]:border-light-mint/50 data-[state=active]:rounded-2xl data-[state=inactive]:bg-white/60 data-[state=inactive]:border-light-mint/30 data-[state=inactive]:rounded-2xl'
            >
              Nutzer
            </ButtonComponent>
          </TabsTrigger>
          <TabsTrigger value='ngos' asChild>
            <ButtonComponent
              variant='primary'
              className='data-[state=active]:bg-light-mint/20 data-[state=active]:border-light-mint/50 data-[state=active]:rounded-2xl data-[state=inactive]:bg-white/60 data-[state=inactive]:border-light-mint/30 data-[state=inactive]:rounded-2xl'
            >
              Verein
            </ButtonComponent>
          </TabsTrigger>
        </TabsList>
        <TabsContent value='users'>
          <LoginFormCard entity='users' />
        </TabsContent>
        <TabsContent value='ngos'>
          <LoginFormCard entity='ngos' />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoginForm;
