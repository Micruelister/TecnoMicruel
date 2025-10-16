// En Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import styles from './Navbar.module.css';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className={styles.navbar}>
      <Link to="/" className={styles.titleLink}>
        <h1>My Online Store</h1>
      </Link>
      <nav className={styles.navLinks}>
        <Link to="/">Home</Link>
        <Link to="/cart">View Cart {totalItems > 0 && `(${totalItems})`}</Link>
        
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
