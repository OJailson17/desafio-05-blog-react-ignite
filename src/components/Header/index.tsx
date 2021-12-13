import Image from 'next/image';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <nav>
        <Image src="/assets/logo.svg" width="239" height="27" priority />
      </nav>
    </header>
  );
}
