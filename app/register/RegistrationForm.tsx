import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RegistrationFormCard from './RegistrationFormCard';
import ButtonComponent from '@/components/ButtonComponent';

const RegistrationForm = () => (
  <Tabs defaultValue='user'>
    <TabsList className='flex gap-2'>
      <TabsTrigger asChild value='user'>
        <ButtonComponent
          variant='primary'
          size='md'
          type='submit'
          className='w-full data-[state=active]:bg-light-mint/20 data-[state=active]:border-light-mint/50 data-[state=active]:rounded-2xl data-[state=inactive]:bg-white/60 data-[state=inactive]:border-light-mint/30 data-[state=inactive]:rounded-2xl'
        >
          Nutzer
        </ButtonComponent>
      </TabsTrigger>

      <TabsTrigger asChild value='ngo'>
        <ButtonComponent
          variant='primary'
          className='data-[state=active]:bg-light-mint/20 data-[state=active]:border-light-mint/50 data-[state=active]:rounded-2xl data-[state=inactive]:bg-white/60 data-[state=inactive]:border-light-mint/30 data-[state=inactive]:rounded-2xl'
        >
          Verein
        </ButtonComponent>
      </TabsTrigger>
    </TabsList>
    <TabsContent value='user'>
      <RegistrationFormCard entity='user' />
    </TabsContent>
    <TabsContent value='ngo'>
      <RegistrationFormCard entity='ngo' />
    </TabsContent>
  </Tabs>
);

export default RegistrationForm;
