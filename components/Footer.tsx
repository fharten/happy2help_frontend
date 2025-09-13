import Image from 'next/image';
import Link from 'next/link';

const Logo = '/images/h2h_logo_mint.png';

export default function Footer() {
  return (
    <footer className='mt-32 pb-8'>
      <div className='px-4 lg:px-8'>
        <div className='bg-light-mint/90 backdrop-blur-xl rounded-3xl shadow-xl px-8 lg:px-12 py-12 lg:py-16'>
          {/* CONTENT */}
          <div className='flex flex-col lg:flex-row gap-12 lg:gap-16'>
            {/* INFO */}
            <div className='lg:flex-1'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2.5 bg-white/60 rounded-full shadow-md'>
                  <Image
                    src={Logo}
                    width={32}
                    height={32}
                    className='h-8 w-8 rounded-lg object-cover'
                    alt='happy2help logo image'
                  />
                </div>
                <span className='text-xl font-bold text-prussian tracking-tight'>
                  Happy<span className='text-black'>2Help</span>
                </span>
              </div>
              <p className='text-prussian text-sm lg:text-base mb-6 max-w-sm font-medium'>
                Menschen verbinden. Veränderung bewirken.
              </p>

              {/* CONTACT */}
              <div className='space-y-4'>
                <div className='flex items-start gap-4'>
                  <div className='p-2.5 rounded-full transition-all duration-200 bg-white/60 text-prussian shadow-lg'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      className='text-prussian'
                    >
                      <path
                        d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'
                        stroke='currentColor'
                        strokeWidth='2.5'
                      />
                      <circle
                        cx='12'
                        cy='10'
                        r='3'
                        stroke='currentColor'
                        strokeWidth='2.5'
                      />
                    </svg>
                  </div>
                  <address className='not-italic text-prussian text-sm font-medium pt-2'>
                    Dingsstraße 12
                    <br />
                    28450 Dings
                  </address>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='p-2.5 rounded-full transition-all duration-200 bg-white/60 text-prussian shadow-lg'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      className='text-prussian'
                    >
                      <path
                        d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'
                        stroke='currentColor'
                        strokeWidth='2.5'
                      />
                    </svg>
                  </div>
                  <a
                    href='tel:+4904011223344'
                    className='text-prussian text-sm font-medium hover:text-black transition-colors duration-200'
                  >
                    (040) 11 22 33 44
                  </a>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='p-2.5 rounded-full transition-all duration-200 bg-white/60 text-prussian shadow-lg'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      className='text-prussian'
                    >
                      <path
                        d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'
                        stroke='currentColor'
                        strokeWidth='2.5'
                      />
                      <polyline
                        points='22,6 12,13 2,6'
                        stroke='currentColor'
                        strokeWidth='2.5'
                      />
                    </svg>
                  </div>
                  <a
                    href='mailto:mail@happy2help.app'
                    className='text-prussian text-sm font-medium hover:text-black transition-colors duration-200'
                  >
                    mail@happy2help.app
                  </a>
                </div>
              </div>
            </div>

            {/* ABOUT */}
            <div className='lg:flex-1'>
              <h3 className='text-lg font-semibold text-prussian mb-6'>
                Über uns
              </h3>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='/story'
                    className='text-prussian text-sm font-medium hover:text-black transition-colors duration-200'
                  >
                    Geschichte
                  </Link>
                </li>
                <li>
                  <Link
                    href='/team'
                    className='text-prussian text-sm font-medium hover:text-black transition-colors duration-200'
                  >
                    Unser Team
                  </Link>
                </li>
                <li>
                  <Link
                    href='/jobs'
                    className='text-prussian text-sm font-medium hover:text-black transition-colors duration-200'
                  >
                    Jobs
                  </Link>
                </li>
                <li>
                  <Link
                    href='/contact'
                    className='text-prussian text-sm font-medium hover:text-black transition-colors duration-200'
                  >
                    Kontakt
                  </Link>
                </li>
              </ul>
            </div>

            {/* LEGAL & SUPPORT */}
            <div className='lg:flex-1'>
              <h3 className='text-lg font-semibold text-prussian mb-6'>
                Support
              </h3>
              <ul className='space-y-2'>
                <li>
                  <Link
                    href='/help'
                    className='text-prussian text-sm font-medium hover:text-black transition-colors duration-200'
                  >
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link
                    href='/privacy'
                    className='text-prussian text-sm font-medium hover:text-black transition-colors duration-200'
                  >
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link
                    href='/terms'
                    className='text-prussian text-sm font-medium hover:text-black transition-colors duration-200'
                  >
                    Hilfe
                  </Link>
                </li>
                <li>
                  <Link
                    href='/cookies'
                    className='text-prussian text-sm font-medium hover:text-black transition-colors duration-200'
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
