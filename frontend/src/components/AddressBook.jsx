
// Contenido FINAL para frontend/src/components/AddressBook.jsx

import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance.js';
import { toast } from 'react-toastify';
import styles from './AddressBook.module.css';

// Importamos los sub-componentes que hemos creado
import AddressForm from './AddressForm.jsx';
import AddressList from './AddressList.jsx';

function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para controlar la UI
  const [isAdding, setIsAdding] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // Contendrá el objeto de la dirección a editar

  // Función para obtener las direcciones del backend
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/user/addresses');
      setAddresses(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Could not fetch addresses.";
      setError(errorMessage);
      // No usamos toast aquí para no ser muy intrusivos al cargar la página
    } finally {
      setLoading(false);
    }
  };

  // Cargar las direcciones cuando el componente se monta
  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddNew = () => {
    setEditingAddress(null); // Limpiamos cualquier edición previa
    setIsAdding(true);       // Entramos en modo "añadir"
  };
  
  const handleCancel = () => {
    setIsAdding(false);
    setEditingAddress(null);
  }

  // Lógica para guardar (Crear o Actualizar)
  const handleSave = async (addressData) => {
    const isEditing = !!editingAddress; // ¿Estamos en modo edición?
    const url = isEditing ? `/api/user/addresses/${editingAddress.id}` : '/api/user/addresses';
    const method = isEditing ? 'put' : 'post';

    try {
      const response = await axiosInstance[method](url, addressData);
      toast.success(response.data.message);
      
      // Refrescamos la lista de direcciones y salimos del modo formulario
      fetchAddresses();
      handleCancel();

    } catch (err) {
      const errorMessage = err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'save'} address.`;
      toast.error(errorMessage);
    }
  };

  // Lógica para eliminar
  const handleDelete = async (addressId) => {
    // Confirmación para evitar borrados accidentales
    if (!window.confirm("Are you sure you want to delete this address? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/api/user/addresses/${addressId}`);
      toast.success(response.data.message);
      fetchAddresses(); // Recargamos las direcciones
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete address.";
      toast.error(errorMessage);
    }
  };
  
  // Función para entrar en modo edición
  const handleEdit = (address) => {
    setIsAdding(false); // Salimos del modo "añadir"
    setEditingAddress(address); // Establecemos la dirección a editar
  }

  return (
    <div className={styles.addressBookSection}>
      <div className={styles.header}>
        <h3>My Address Book</h3>
        {/* Solo mostramos el botón "Añadir" si no estamos ya en un formulario */}
        {!isAdding && !editingAddress && (
          <button onClick={handleAddNew} className={styles.addButton}>
            + Add New Address
          </button>
        )}
      </div>
      
      {loading && <p>Loading addresses...</p>}
      {error && !loading && <p className={styles.error}>{error}</p>}
      
      {!loading && !error && (
        <> 
          {/* Si estamos añadiendo o editando, mostramos el formulario */}
          {isAdding || editingAddress ? (
            <AddressForm 
              onSave={handleSave} 
              onCancel={handleCancel}
              initialData={editingAddress} // Será `null` si es nuevo, o un objeto si es para editar
            />
          ) : (
            /* Si no, mostramos la lista de direcciones */
            <AddressList 
              addresses={addresses} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
            />
          )}
        </>
      )}
    </div>
  );
}

export default AddressBook;
