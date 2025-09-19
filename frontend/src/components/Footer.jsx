// Contenido para frontend/src/components/Footer.jsx

import styles from './Footer.module.css'; // Crearemos este archivo

function Footer() {
  const currentYear = new Date().getFullYear(); // Obtiene el año actual dinámicamente

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>&copy; {currentYear} My Online Store. All Rights Reserved.</p>
        <div className={styles.footerLinks}>
          {/* Estos son enlaces de ejemplo. No crearán nuevas páginas todavía. */}
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;