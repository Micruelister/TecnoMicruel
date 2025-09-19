// =================================================================
// FILE: HomePage.jsx (WITH REAL-TIME CLIENT-SIDE SEARCH)
// PURPOSE: Displays the main product grid and allows users to search.
// =================================================================

import { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import axiosInstance from '../api/axiosInstance.js';
import styles from './HomePage.module.css'; // Styles for the search bar
import '../App.css'; // For the global .container and .product-grid classes

function HomePage() {
  // --- STATE MANAGEMENT ---

  // State to store the full list of products fetched from the API.
  // This original list never changes after being fetched.
  const [products, setProducts] = useState([]);

  // State to store the user's current search input.
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  // State to manage the initial loading message.
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---

  // useEffect hook to fetch products from the backend API when the component mounts.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        // In a real app, you might set an error state here to show a message.
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // The empty dependency array [] means this effect runs only once.

  // --- FILTERING LOGIC ---
  const brands = useMemo(() => {
    const allBrands = products.map(p => p.brand);
    // Creamos un Set para obtener solo los valores únicos, y luego lo convertimos a un array.
    return ['All', ...new Set(allBrands)];
  }, [products]);
  // Filter the `products` array based on the `searchTerm`.
  // This calculation happens on every render, so the list updates instantly as the user types.
  const filteredProducts = products.filter(product => {
    // --- FILTER CONDITIONS ---
    // Convert both the product name and search term to lower case for case-insensitive matching.
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBrand = selectedBrand === 'All' || product.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  // --- RENDER LOGIC ---

  // Display a loading message while the initial product fetch is in progress.
  if (loading) {
    return <main className="container"><p>Loading products...</p></main>;
  }

  return (
    <main className="container">
      {/* Search Bar Input */}
      <div className={styles.searchContainer}>
        <input 
          type="search" // Using type="search" provides a clear 'x' button in some browsers
          placeholder="Search for products by name..."
          className={styles.searchInput}
          value={searchTerm} // The input's value is controlled by our state
          onChange={(e) => setSearchTerm(e.target.value)} // Update state on every keystroke
        />
      </div>
      
      <div className={styles.filterContainer}>
        <p>Filter by Brand:</p>
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
      <h2>Featured Products</h2>
      
      <div className="product-grid">
        {/* We map over the FILTERED list of products, not the original one. */}
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 
        Conditional Rendering for "No Results".
        This message only appears if:
        1. The filtered list is empty (filteredProducts.length === 0)
        2. The search term is not empty (searchTerm !== '') 
           (This prevents the message from showing during the initial load)
      */}
      {filteredProducts.length === 0 && searchTerm && (
        <p className={styles.noResults}>No products found matching your search for "{searchTerm}".</p>
      )}
    </main>
  );
}

export default HomePage;