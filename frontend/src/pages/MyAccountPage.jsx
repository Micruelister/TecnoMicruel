// Contenido COMPLETO para frontend/src/pages/MyAccountPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import axiosInstance from '../api/axiosInstance.js';
import { toast } from 'react-toastify';
import styles from './MyAccountPage.module.css';
import '../App.css';

function MyAccountPage() {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ username: '', email: '', phoneNumber: '' });
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // useEffect para buscar el historial de pedidos cuando la página carga
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/my-orders');
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error.response || error);
        toast.error("Could not load order history.");
      } finally {
        setLoading(false);
      }
    };
    
    // Solo buscamos los pedidos si el usuario está cargado
    if (user) {
      fetchOrders();
    }
  }, [user]); // Se ejecuta cuando el estado 'user' cambia

// Rellenamos el formulario con los datos del usuario del contexto
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };
  const handlePasswordChange = (e) => {
  setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    try {
      const response = await axiosInstance.post('/api/user/change-password', passwordData);
      toast.success(response.data.message);
      // Limpiamos los campos del formulario de contraseña
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update password.";
      toast.error(errorMessage);
    } finally {
      setPasswordSaving(false);
    }
  };
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await axiosInstance.put('/api/user/profile', profileData);
      
      // ¡MUY IMPORTANTE! Actualizamos el estado global de autenticación con los nuevos datos
      updateUser(response.data.user); 
      
      toast.success(response.data.message);
      setIsEditing(false); // Volvemos al modo vista
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update profile.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };
  
  if (!user) {
    return <main className="container"><p>Loading user data...</p></main>;
  }
  
return (
    <main className="container">
      <h2 style={{textAlign: 'center', fontSize: '2.5rem', marginBottom: '2rem'}}>My Account</h2>
      <div className={styles.accountSection}>
        <div className={styles.infoHeader}>
          <h3>Account Information</h3>
          
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className={styles.editButton}>
              Edit Profile
            </button>
          )}
        </div>
        
        {isEditing ? (
          // SI estamos editando, muestra el formulario CON los botones de guardar/cancelar
          <form onSubmit={handleProfileSave} className={styles.editForm}>
            <div className={styles.formGroup}>
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" value={profileData.username} onChange={handleProfileChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={profileData.email} onChange={handleProfileChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <input type="tel" id="phoneNumber" name="phoneNumber" value={profileData.phoneNumber} onChange={handleProfileChange} />
            </div>            
            <div className={styles.buttonGroup}>
              <button type="button" onClick={() => setIsEditing(false)} className={styles.cancelButton}>Cancel</button>
              <button type="submit" disabled={saving} className={styles.saveButton}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          // SI NO estamos editando, muestra la información estática
          <div className={styles.viewInfo}>
            <strong>Username:</strong> <span>{user.username}</span>
            <strong>Email:</strong> <span>{user.email}</span>
            <strong>Phone:</strong> <span>{user.phoneNumber || 'Not provided'}</span>
          </div>
        )}
      </div>

      <div className={styles.accountSection}>
        <div className={styles.infoHeader}>
          <h3>Change Password</h3>
          {!showPasswordForm && (
            <button 
              onClick={() => setShowPasswordForm(true)} 
              className={styles.editButton}
            >
              Change
            </button>
          )}
        </div>

        {/* 
          This form is only rendered if 'showPasswordForm' is true.
        */}
        {showPasswordForm && (
          <form onSubmit={handlePasswordSave}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <input 
                type="password" 
                id="currentPassword" 
                name="currentPassword" 
                value={passwordData.currentPassword} 
                onChange={handlePasswordChange} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input 
                type="password" 
                id="newPassword" 
                name="newPassword" 
                value={passwordData.newPassword} 
                onChange={handlePasswordChange} 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword" 
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange} 
                required 
              />
            </div>
            <div className={styles.buttonGroup}>
              {/* 
                This "Cancel" button simply hides the form again by setting
                'showPasswordForm' back to false.
              */}
              <button 
                type="button" 
                onClick={() => setShowPasswordForm(false)} 
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={passwordSaving} 
                className={styles.saveButton}
              >
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}
      </div>
      <div className={styles.orderHistory}>
        <h3>My Order History</h3>
        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>You have not placed any orders yet.</p>
        ) : (
          <div className={styles.ordersList}>
            {orders.map(order => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <h4>Order #{order.id}</h4>
                  <span>Date: {order.date}</span>
                </div>
                <div className={styles.orderDetails}>
                  <div className= {styles.detailColumn}>
                    <strong>General Info:</strong>
                    <span>Customer: {order.shippingInfo.fullName}</span>
                    <span>Status: {order.status}</span>
                    <span>Total: ${order.total.toFixed(2)}</span>
                  </div>
                  <div className={styles.detailColumn}>
                    <strong>Shipped to:</strong>
                    <address className = {styles.addressBlock}>
                      {order.shippingInfo.fullName}<br />
                      {order.shippingInfo.streetAddress}<br />
                      {order.shippingInfo.apartmentSuite && <>{order.shippingInfo.apartmentSuite}<br /></>}
                      {order.shippingInfo.city}{order.shippingInfo.postalCode}<br />
                      {order.shippingInfo.country}<br />
                      {order.shippingInfo.phoneNumber || 'N/A'}
                    </address>
                  </div>
                  <div className={`${styles.detailColumn} ${styles.orderItems}`}>
                    <strong>Items:</strong>
                    <ul>
                      {order.products.map((product, index) => (
                        <li key={index}>
                          {product.name} (x{product.quantity})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyAccountPage;