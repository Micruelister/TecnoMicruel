// =================================================================
// FILE: OrderSuccessPage.jsx (FINAL VERSION WITH BUG FIX)
// PURPOSE: Verifies the Stripe payment and confirms the order.
// =================================================================

import { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import axiosInstance from '../api/axiosInstance.js';
import '../App.css';

function OrderSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { clearCart } = useCart();

  // useRef is used to prevent the useEffect from running twice in React 18's Strict Mode
  const effectRan = useRef(false);

  useEffect(() => {
    // Only run the verification logic once
    if (effectRan.current === false) {
      const verifySession = async () => {
        const sessionId = new URLSearchParams(location.search).get('session_id');

        if (!sessionId) {
          setError("No session ID found. Cannot verify purchase.");
          setLoading(false);
          return;
        }

        try {
          await axiosInstance.post('/api/order/verify', { sessionId });
          // Clear the cart from the frontend state and localStorage
          clearCart();
        } catch (err) {
          const errorMessage = err.response?.data?.message || "Failed to verify your purchase.";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      verifySession();

      // Mark that the effect has run
      return () => {
        effectRan.current = true;
      };
    }
  }, [location, clearCart]); // Dependencies remain to follow best practices

  if (loading) {
    return (
      <main className="container" style={{ textAlign: 'center' }}>
        <h2>Verifying your payment...</h2>
        <p>Please do not close this page.</p>
      </main>
    );
  }
  
  if (error) {
    return (
      <main className="container" style={{ textAlign: 'center' }}>
        <h2>There was an error with your order</h2>
        <p style={{ color: '#c0392b' }}>{error}</p>
        <Link to="/">Go back to Homepage</Link>
      </main>
    );
  }

  return (
    <main className="container" style={{ textAlign: 'center' }}>
      <h2>Thank You For Your Purchase!</h2>
      <p>Your order has been successfully processed.</p>
      <p>You will receive a confirmation email shortly.</p>
      <Link to="/">Continue Shopping</Link>
    </main>
  );
}

export default OrderSuccessPage;