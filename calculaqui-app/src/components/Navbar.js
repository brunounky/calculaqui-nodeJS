import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Image
            src="/favicon.ico"
            alt="Logo"
            width={32}
            height={32}
            className={styles.logo}
          />
          <span className={styles.devName}>
            Bruno Unky
          </span>
        </div>
      </div>
    </header>
  );
}