// =================================================================
// FILE: ProductCard.jsx (IMPROVED UX VERSION)
// =================================================================

import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import styles from './ProductCard.module.css';    

function ProductCard({ product }) {
  const { addToCart } = useCart();

  if (!product) return null;

  // 1. Creamos una nueva función para manejar el clic del botón
  const handleAddToCartClick = (event) => {
    event.stopPropagation();
    event.preventDefault(); // Prevent the Link navigation
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`} className={styles.productLink}>
      <div className={styles.card}>
        <img src={product.thumbnailUrl || 'https://via.placeholder.com/300'} alt={product.name} className={styles.image} />
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>${product.price ? product.price.toFixed(2) : '0.00'}</p>
        <p className={styles.stock}>Remaining: {product.stock}</p>
        <p className={styles.brand}>Brand: {product.brand}</p>
        
        {/* 4. Le decimos al botón que use nuestra nueva función en el evento onClick */}
        <button onClick={handleAddToCartClick} className={styles.button} type="button">
          Add to Cart
        </button>
      </div>  
    </Link>
  );
}

export default ProductCard;