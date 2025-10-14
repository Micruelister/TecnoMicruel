// =================================================================
// FILE: HomePage.jsx (WITH SERVER-SIDE SEARCH & FILTER)
// PURPOSE: Displays product grid, fetches filtered data from the server.
// =================================================================

import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import axiosInstance from '../api/axiosInstance.js';
import styles from './HomePage.module.css';
import '../App.css'; 

function HomePage() {
  // --- STATE MANAGEMENT ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [brands, setBrands] = useState(['All']);

  // --- DATA FETCHING ---

  // 1. Fetch available brands for the filter UI
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axiosInstance.get('/api/brands');
        setBrands(['All', ...response.data]); // Add 'All' to the list of brands from the API
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []); // Runs once on component mount

  // 2. Fetch products based on current search and brand filters
  // useCallback memoizes the function to prevent re-creation on every render
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        brand: selectedBrand,
      });
      const response = await axiosInstance.get(`/api/products?${params}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      // Consider setting an error state here to show a message to the user
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedBrand]); // Dependencies: re-create the function if these change

  // 3. Debounce the product fetching
  useEffect(() => {
    // Set a timer to delay the API call
    const timerId = setTimeout(() => {
      fetchProducts();
    }, 500); // 500ms delay

    // Cleanup: clear the timer if the user types again before the delay is over
    return () => clearTimeout(timerId);
  }, [fetchProducts]); // Dependency: the memoized fetch function

  // --- RENDER LOGIC ---
  return (
    <main className="container">
      <div className={styles.controlsContainer}>
        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <input 
            type="search"
            placeholder="Search by product name..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Brand Filter Buttons */}
        <div className={styles.filterContainer}>
          <span>Filter by Brand:</span>
          <div className={styles.brandButtons}>
            {brands.map(brand => (
              <button
                key={brand}
                className={`${styles.filterButton} ${selectedBrand === brand ? styles.active : ''}`}
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h2>Featured Products</h2>

      {/* Product Grid and Loading/No Results Messages */}
      {loading ? (
        <p>Loading products...</p>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className={styles.noResults}>No products found matching your criteria.</p>
      )}
    </main>
  );
}

export default HomePage;
