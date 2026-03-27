import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className={styles.navbar}>
      <Link 
        to="/" 
        className={location.pathname === '/' ? `${styles.link} ${styles.activeLink}` : styles.link}
      >
        Home
      </Link>
      <Link 
        to="/Sheets" 
        className={location.pathname === '/Sheets' ? `${styles.link} ${styles.activeLink}` : styles.link}
      >
        Sheets
      </Link>
      {/* Added View route to Navbar */}
      <Link 
        to="/View" 
        className={location.pathname === '/View' ? `${styles.link} ${styles.activeLink}` : styles.link}
      >
        View
      </Link>
    </nav>
  );
}

export default Navbar;