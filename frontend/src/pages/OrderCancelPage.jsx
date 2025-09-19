// Contenido para frontend/src/pages/OrderCancelPage.jsx
import { Link } from 'react-router-dom';
import '../App.css';

function OrderCancelPage() {
  return (
    <main className="container">
      <h2>Payment Canceled</h2>
      <p>Your order was not processed. Your cart has been saved if you'd like to try again.</p>
      <Link to="/cart">Return to Cart</Link>
    </main>
  );
}

export default OrderCancelPage;