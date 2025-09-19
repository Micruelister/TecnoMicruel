// =================================================================
// FILE: CartPage.jsx (CORRECTED AND IMPROVED VERSION)
// =================================================================

import { useCart } from '../context/CartContext.jsx';
import { Link } from 'react-router-dom'; // Import Link for better navigation
import styles from './CartPage.module.css';
import '../App.css'; 

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <main className="container">
      <h2>My Shopping Cart</h2>

      {cartItems.length === 0 ? (
        // Added a <Link> component for better user experience
        <p>Your shopping cart is empty. <Link to="/">Go find something nice!</Link></p>
      ) : (
        <>
          <div className={styles.cartActionsHeader}>
            <button onClick={clearCart} className={styles.clearCartButton}>Clear Entire Cart</button>
          </div>
          <div className={styles.cartLayout}>
            <div className={styles.cartItems}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.cartItem}>
                  <img src={item.thumbnailUrl || 'https://via.placeholder.com/150'} alt={item.name} className={styles.itemImage} />
                  
                  {/* --- CORRECTION STARTS HERE --- */}
                  <div className={styles.itemDetails}>
                    {/* ADDED: Display the product name */}
                    <h3>{item.name}</h3> 
                    
                    {/* ADDED: Display the unit price clearly */}
                    <p className={styles.unitPrice}>Price per unit: ${item.price.toFixed(2)}</p>

                    {/* MOVED AND IMPROVED: The quantity control is now here */}
                    <div className={styles.quantityControl}>
                      <span>Quantity:</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  {/* --- CORRECTION ENDS HERE --- */}

                  <div className={styles.itemActions}>
                    <p className={styles.itemSubtotal}>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.id)} className={styles.removeButton}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.cartSummary}>
              <h3>Order Summary</h3>
              <div className={styles.summaryLine}>
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className={styles.summaryLine}>
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <hr />
              <div className={`${styles.summaryLine} ${styles.total}`}>
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className={styles.checkoutButton}>
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default CartPage;