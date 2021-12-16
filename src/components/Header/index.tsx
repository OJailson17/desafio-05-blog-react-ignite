import Image from 'next/image';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <nav>
        <Link href="/">
          <a>
            <Image
              src="/assets/logo.svg"
              alt="logo"
              width="239"
              height="27"
              priority
            />
          </a>
        </Link>
      </nav>
    </header>
  );
}
