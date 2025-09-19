// Contenido para frontend/src/pages/ManageOrdersPage.jsx

import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance.js';
import { toast } from 'react-toastify';
import styles from './ManageOrdersPage.module.css'; // Crearemos este archivo
import '../App.css';

function ManageOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/admin/orders');
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching ALL orders:", error.response || error);
        toast.error("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <main className="container"><p>Loading orders...</p></main>;
  }

  return (
    <main className="container">
      <h2>Manage Customer Orders</h2>
      {orders.length === 0 ? (
        <p>There are no orders to display.</p>
      ) : (
        <div className={styles.ordersContainer}>
          {orders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <h3>Order #{order.id}</h3>
                <span>{order.date}</span>
              </div>
              <div className={styles.orderDetails}>
                <div>
                  <strong>Customer:</strong> {order.customer_name}<br />
                  <strong>Total:</strong> ${order.total.toFixed(2)}
                </div>
                <div>
                  <strong>Shipping Address:</strong><br />
                  <address className={styles.addressBlock}>
                    {order.shipping_info.full_name}<br />
                    {order.shipping_info.address}<br />
                    {order.shipping_info.apartmentSuite && <>{order.shipping_info.apartmentSuite}<br /></>}
                    {order.shipping_info.city}, {order.shipping_info.postal_code}<br />
                    {order.shipping_info.country}<br />
                    <strong>Phone:</strong> {order.shipping_info.phoneNumber || 'N/A'}
                  </address>

                </div>
              </div>
              <div className={styles.orderItems}>
                <h4>Items in this order:</h4>
                <ul>
                  {order.products.map((product, index) => (
                    <li key={index}>
                      {product.quantity} x {product.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default ManageOrdersPage;