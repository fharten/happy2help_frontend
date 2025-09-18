import ButtonComponent from '@/components/ButtonComponent';
import MainHeadline from '@/components/MainHeadline';

const page = () => {
  return (
    <div className='site-container'>
      <MainHeadline>
        <span className='font-extralight'>Zugriff </span>
        <strong className='font-bold'>verweigert</strong>
        <span className='font-extralight'>
          , <br />
          Du bist nicht{' '}
        </span>
        <strong className='font-bold'>authorisiert</strong>
      </MainHeadline>
      <div className='flex flex-col gap-y-4 max-w-lg mx-auto'>
        <p className='font-bold'>Mögliche Gründe:</p>
        <p>· Du bist nicht eingeloggt.</p>
        <p>
          · Dein Benutzerkonto verfügt nicht über die erforderlichen Rechte.
        </p>

        <div className='flex justify-end'>
          <ButtonComponent
            variant='primary'
            size='md'
            className='w-40 data-[state=active]:bg-light-mint/20 data-[state=active]:border-light-mint/50 data-[state=active]:rounded-2xl data-[state=inactive]:bg-white/60 data-[state=inactive]:border-light-mint/30 data-[state=inactive]:rounded-2xl'
          >
            Zurück zur Startseite
          </ButtonComponent>
        </div>
      </div>
    </div>
  );
};

export default page;
