// En Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // 1. Importamos el hook
import { useCart } from '../context/CartContext.jsx';
import styles from './Navbar.module.css';

function Navbar() {
  const { user, logout } = useAuth(); // 2. Leemos el usuario y la función logout de la pizarra
  const { cartItems } = useCart();
  console.log("Navbar rendering. Current user:", user); // microfono 1
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className={styles.navbar}>
      <h1><Link to="/" className={styles.titleLink}>My Online Store</Link></h1>
      <nav className={styles.navLinks}>
        <Link to="/">Home</Link>
        <Link to="/cart">View Cart {totalItems > 0 && `(${totalItems})`}</Link>
        
        {/* 3. Lógica condicional */}
        {user ? (
          <>
            <Link to="/my-account">My Account</Link>  
            {user.is_admin && (
              <>
              <Link to="/admin/inventory">Manage Inventory</Link>
              <Link to="/admin/orders">Orders</Link>
              </>
            )}            
            <button onClick={logout} className={styles.logoutButton}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}

export default Navbar;