// Contenido para frontend/src/components/AddressForm.jsx

import { useState, useEffect } from 'react';
import styles from './AddressBook.module.css'; // Reutilizamos los estilos

function AddressForm({ onSave, onCancel, initialData }) {
  const [formData, setFormData] = useState({
    fullName: '',
    streetAddress: '',
    apartmentSuite: '',
    city: '',
    postalCode: '',
    country: '',
    phoneNumber: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Si nos pasan datos iniciales (para editar), llenamos el formulario con ellos.
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Si no hay datos (es para añadir), nos aseguramos que el form esté vacío
      setFormData({
        fullName: '',
        streetAddress: '',
        apartmentSuite: '',
        city: '',
        postalCode: '',
        country: '',
        phoneNumber: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Llamamos a la función onSave que nos pasó el componente padre
    // y le pasamos los datos del formulario.
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="fullName">Full Name</label>
        <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="streetAddress">Street Address</label>
        <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} required />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="apartmentSuite">Apartment, suite, etc. (Optional)</label>
        <input type="text" name="apartmentSuite" value={formData.apartmentSuite} onChange={handleChange} />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="city">City</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange} required />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="postalCode">Postal Code</label>
        <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
      </div>
       <div className={styles.formGroup}>
        <label htmlFor="country">Country</label>
        <input type="text" name="country" value={formData.country} onChange={handleChange} required />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="phoneNumber">Phone Number</label>
        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
      </div>
      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
        <button type="submit" disabled={isSaving} className={styles.saveButton}>
          {isSaving ? 'Saving...' : 'Save Address'}
        </button>
      </div>
    </form>
  );
}

export default AddressForm;
