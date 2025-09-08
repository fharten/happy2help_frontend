// components/Footer.js
import Image from 'next/image';
import Link from 'next/link';

const Logo = '/images/h2h_logo_mint.png';

export default function Footer() {
  return (
    <footer>
      <div>
        {/* CONTENT */}
        <div className='flex'>
          {/* INFO*/}
          <div>
            <div>
              <Image
                src={Logo}
                width='40'
                height='40'
                className='h-10 w-10'
                alt='happy2help logo image'
              />
              <span>happy2help</span>
            </div>
            <p>Menschen verbinden. Veränderung bewirken.</p>

            {/* CONTACT */}
            <div>
              <div>
                <address className='not-italic'>
                  Dingsstraße 12
                  <br />
                  28450 Dings
                </address>
              </div>
              <div>
                <a href='tel:+4904011223344'>(040) 11 22 33 44</a>
              </div>
              <div>
                <a href='mailto:mail@happy2help.app'>mail@happy2help.app</a>
              </div>
            </div>
          </div>

          {/* ABOUT */}
          <div>
            <h3>Über uns</h3>
            <ul>
              <li>
                <Link href='/story'>Geschichte</Link>
              </li>
              <li>
                <Link href='/team'>Unser Team</Link>
              </li>
              <li>
                <Link href='/jobs'>Jobs</Link>
              </li>
              <li>
                <Link href='/contact'>Kontakt</Link>
              </li>
            </ul>
          </div>

          {/* LEGAL & SUPPORT */}
          <div>
            <h3>Support</h3>
            <ul>
              <li>
                <Link href='/help'>Impressum</Link>
              </li>
              <li>
                <Link href='/privacy'>Datenschutz</Link>
              </li>
              <li>
                <Link href='/terms'>Hilfe</Link>
              </li>
              <li>
                <Link href='/cookies'>Cookie Policy</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div>
          <div>
            <div>
              <p>
                &copy; {new Date().getFullYear()} happy2help. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
