// =================================================================
// FILE: CreateProductPage.jsx (HANDLES MULTIPLE IMAGE UPLOADS)
// PURPOSE: Renders a form for admins to create a new product.
// =================================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import styles from './AuthForm.module.css'; // Reusing our consistent form styles

function CreateProductPage() {
  // State for each individual form field
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  
  // State for the images. It will now hold an array of file objects.
  const [images, setImages] = useState([]); 
  
  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // This function is called when the form is submitted
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // We use FormData because we are sending files (images) along with text data.
    // Standard JSON cannot handle file uploads.
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('description', description);
    formData.append('brand', brand);

    // If the user has selected images, loop through the array and append each one.
    // The key 'images' must match what the backend expects with `request.files.getlist('images')`.
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }

    try {
      const response = await axiosInstance.post('/admin/product/new', formData);
      toast.success(response.data.message);
      navigate('/admin/inventory'); // Redirect to the inventory list on success
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // This function handles the file input change
  const handleImageChange = (e) => {
    // e.target.files is a FileList, not a true array.
    // Array.from() converts it into an array so we can easily work with it.
    setImages(Array.from(e.target.files));
  };

  return (
    <div className={styles.formContainer}>
      <h2>Add New Product</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Product Name:</label>
          <input
            className={styles.formInput}
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="price">Price:</label>
          <input
            className={styles.formInput}
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            step="0.01"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="stock">Stock:</label>
          <input
            className={styles.formInput}
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
         <div className={styles.formGroup}>
          <label htmlFor="brand">Brand:</label>
          <input
            className={styles.formInput}
            type="text"
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Description:</label>
          <textarea
            className={styles.formInput}
            id="description"
            rows="5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="images">Product Images:</label>
          <input
            className={styles.formInput}
            type="file"
            id="images"
            name="images" // Name attribute is good practice
            accept="image/*"
            multiple // This HTML attribute allows selecting multiple files
            onChange={handleImageChange}
          />
        </div>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}

export default CreateProductPage;