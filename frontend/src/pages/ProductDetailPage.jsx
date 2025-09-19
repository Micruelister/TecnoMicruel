// =================================================================
// FILE: ProductDetailPage.jsx (FINAL VERSION WITH ENHANCED UI)
// PURPOSE: Displays a detailed view of a single product with an image gallery.
// =================================================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import axiosInstance from '../api/axiosInstance.js';
import { toast } from 'react-toastify';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import styles from './ProductDetailPage.module.css';
import '../App.css';

function ProductDetailPage() {
  // useParams hook from React Router to get the dynamic ':id' from the URL.
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get the addToCart function from our global CartContext.
  const { addToCart } = useCart();
  
  // State to hold the specific product's data fetched from the API.
  const [product, setProduct] = useState(null);
  // State for the main image shown in the gallery.
  const [mainImage, setMainImage] = useState('');
  // State for the quantity selector input.
  const [quantity, setQuantity] = useState(1);
  // State to manage the loading UI feedback.
  const [loading, setLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // This effect runs once when the component mounts or when the 'id' in the URL changes.
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/products/${id}`);
        setProduct(response.data);

        // When the product data arrives, set the first image as the main one.
        if (response.data.imageUrls && response.data.imageUrls.length > 0) {
          setMainImage(response.data.imageUrls[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Could not find the requested product.");
        // If the product doesn't exist, redirect the user back to the homepage.
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, navigate]); // Dependencies: re-run the effect if `id` or `navigate` changes.

  // Handler for the "Add to Cart" button.
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity); // Pass the selected quantity to the context.
    }
  };

  // Handler for the quantity input field.
  const handleQuantityChange = (e) => {
    // Ensure the value is a number and is at least 1.
    const value = Math.max(1, parseInt(e.target.value) || 1);
    // Also ensure the value does not exceed the available stock.
    setQuantity(Math.min(value, product.stock));
  };

  // Render a loading message while data is being fetched.
  if (loading) {
    return <main className="container"><p style={{textAlign: 'center'}}>Loading product details...</p></main>;
  }

  // Render a "not found" message if the product couldn't be fetched.
  if (!product) {
    return (
      <main className="container" style={{textAlign: 'center'}}>
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist.</p>
        <Link to="/">Back to Homepage</Link>
      </main>
    );
  }
  const slides = product.imageUrls ? product.imageUrls.map(url => ({ src: url })) : [];
  // Render the full page with product details once data is available.
  return (
    <main className="container">
      <div className={styles.detailLayout}>
        {/* --- IMAGE GALLERY SECTION --- */}
        <div className={styles.gallery}>
          <div className={styles.mainImageContainer}>
            <img src={mainImage || 'https://via.placeholder.com/500'} alt={product.name} 
            onClick={() => slides.length > 0 && setIsLightboxOpen(true)}
          />
            
          </div>
          <div className={styles.thumbnailContainer}>
            {/* Map over all available image URLs to create clickable thumbnails */}
            {product.imageUrls && product.imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${product.name} thumbnail ${index + 1}`}
                // Apply an 'active' class if the thumbnail is the current main image
                className={url === mainImage ? styles.activeThumbnail : styles.thumbnail}
                // When a thumbnail is clicked, update the main image
                onClick={() => setMainImage(url)}
              />
            ))}
          </div>
        </div>

        {/* --- PRODUCT INFORMATION SECTION --- */}
        <div className={styles.infoContainer}>
          <h2 className={styles.productTitle}>{product.name}</h2>
          <p className={styles.price}>${product.price ? product.price.toFixed(2) : '0.00'}</p>
          <p className={styles.stock}>
            {product.stock > 0 ? `${product.stock} units available` : ''}
          </p>
          <hr className={styles.divider} />
          <p className={styles.description}>
            {product.description || 'No description available for this product.'}
          </p>

          {/* --- ACTIONS CONTAINER (QUANTITY + BUTTON) --- */}
          <div className={styles.actionsContainer}>
            {product.stock > 0 && ( // Only show quantity selector if in stock
              <div className={styles.quantitySelector}>
                <label htmlFor="quantity">Quantity:</label>
                <input 
                  type="number" 
                  id="quantity" 
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={product.stock}
                />
              </div>
            )}
            <button 
              onClick={handleAddToCart} 
              className={styles.addToCartButton}
              disabled={product.stock === 0}
            >
              {product.stock > 0 ? `Add ${quantity} to Cart` : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={slides}
      />      
    </main>
  );
}

export default ProductDetailPage;