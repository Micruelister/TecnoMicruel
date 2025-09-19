// =================================================================
// FILE: EditProductPage.jsx (CORRECTED FOR MULTIPLE IMAGES & ALL FIELDS)
// =================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import styles from './AuthForm.module.css';

function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for all form fields, matching the Product model
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    brand: ''
  });
  
  // State to hold the list of currently existing image URLs
  const [currentImages, setCurrentImages] = useState([]);
  // State for the NEW images the user selects to upload
  const [newImages, setNewImages] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Effect to fetch the existing product data when the page loads
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/products/${id}`);
        const product = response.data;
        
        // Populate the form fields with the fetched data
        setFormData({
          name: product.name,
          price: product.price,
          stock: product.stock,
          description: product.description || '',
          brand: product.brand || ''
        });
        setCurrentImages(product.imageUrls || []);

      } catch (error) {
        toast.error("Failed to load product data.");
        navigate('/admin/inventory');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // A single handler for all text input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewImages(Array.from(e.target.files));
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const dataToSubmit = new FormData();
    // Append all text data
    for (const key in formData) {
      dataToSubmit.append(key, formData[key]);
    }
    // Append all new image files
    if (newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        dataToSubmit.append('images', newImages[i]);
      }
    }

    try {
      // Note: We are using POST here as specified in the backend route
      const response = await axiosInstance.post(`/api/products/${id}`, dataToSubmit);
      toast.success(response.data.message);
      navigate('/admin/inventory');
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update product.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className="container"><p>Loading product data...</p></main>;
  }

  return (
    <div className={styles.formContainer}>
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit}>
        {/* --- Text fields are now linked to the formData state object --- */}
        <div className={styles.formGroup}>
          <label htmlFor="name">Product Name:</label>
          <input className={styles.formInput} type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="price">Price:</label>
          <input className={styles.formInput} type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} required step="0.01" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="stock">Stock:</label>
          <input className={styles.formInput} type="number" id="stock" name="stock" value={formData.stock} onChange={handleInputChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="brand">Brand:</label>
          <input className={styles.formInput} type="text" id="brand" name="brand" value={formData.brand} onChange={handleInputChange} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Description:</label>
          <textarea className={styles.formInput} id="description" name="description" rows="5" value={formData.description} onChange={handleInputChange}></textarea>
        </div>
        
        {/* --- Image management section --- */}
        <div className={styles.formGroup}>
          <label>Current Images:</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {currentImages.length > 0 ? (
              currentImages.map((url, index) => (
                <img key={index} src={url} alt={`Current ${index}`} style={{width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px'}} />
              ))
            ) : <p style={{fontSize: '0.9rem', color: '#777'}}>No images on file.</p>}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="images">Add New Images (optional):</label>
          <input className={styles.formInput} type="file" id="images" name="images" accept="image/*" multiple onChange={handleImageChange} />
        </div>
        
        <button type="submit" className={styles.submitButton} disabled={saving}>
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
      <p className={styles.switchFormLink}>
        <Link to="/admin/inventory">Back to Inventory</Link>
      </p>
    </div>
  );
}

export default EditProductPage;