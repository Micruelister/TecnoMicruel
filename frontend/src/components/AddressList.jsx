// Contenido para frontend/src/components/AddressList.jsx

import React from 'react';
import styles from './AddressBook.module.css'; // Reutilizamos los estilos que ya creamos

function AddressList({ addresses, onEdit, onDelete }) {
  if (addresses.length === 0) {
    return <p>You have no saved addresses. Add one to get started!</p>;
  }

  return (
    <div className={styles.addressList}>
      {addresses.map(address => (
        <div key={address.id} className={styles.addressCard}>
          <address>
            <strong>{address.fullName}</strong><br />
            {address.streetAddress}<br />
            {address.apartmentSuite && <>{address.apartmentSuite}<br /></>}
            {address.city}, {address.postalCode}<br />
            {address.country}<br />
            Phone: {address.phoneNumber || 'N/A'}
          </address>
          <div className={styles.cardActions}>
            <button onClick={() => onEdit(address)} className={styles.editButton}>
              Edit
            </button>
            <button onClick={() => onDelete(address.id)} className={styles.deleteButton}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AddressList;
