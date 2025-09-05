import { cn } from '@/lib/utils';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginFormCard from './LoginFormCard';

const LoginForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Tabs defaultValue='users'>
        <TabsList>
          <TabsTrigger value='users'>Nutzer</TabsTrigger>
          <TabsTrigger value='ngos'>Verein</TabsTrigger>
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
