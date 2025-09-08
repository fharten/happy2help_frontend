import Image from 'next/image';
import Link from 'next/link';

const Logo = '/images/h2h_logo_mint.png';

const Header = () => {
  return (
    <header>
      <nav aria-label='Main navigation'>
        <div className='flex justify-between items-center h-16'>
          {/* LOGO */}
          <div>
            <Link href={'/'}>
              <Image
                src={Logo}
                height={40}
                width={40}
                className='h-10 w-10'
                alt='Logo image'
              />
            </Link>
          </div>

          {/* DASHBOARD */}
          <div>
            <Link href={'/dasboard'}>Dashboard</Link>
          </div>

          {/* DASHBOARD */}
          <div>
            <Link href={'/login'}>Dashboard</Link>
          </div>

          {/* EDIT PROFILE */}
          <div>
            <Link href={'/profile'}>Edit profile</Link>
          </div>

          {/* PROJECTS LIST */}
          <div>
            <Link href={'/projects'}>Projects</Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
