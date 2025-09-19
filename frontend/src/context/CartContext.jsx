// =================================================================
// FILE: CartContext.jsx (FINAL, FULLY FEATURED & OPTIMIZED VERSION)
// PURPOSE: Manages all global state and logic for the shopping cart.
// =================================================================

import { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import { toast } from 'react-toastify';

// 1. Create the context object. This is what components will consume.
const CartContext = createContext(null);

// 2. Create the Provider component. This component will wrap our application
//    and provide the cart state and functions to all children.
export function CartProvider({ children }) {
  const { user } = useAuth(); // Get the current user state to clear cart on logout

  // Initialize state by trying to read from localStorage first.
  // This function runs only once on the initial render.
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('cartItems');
    try {
      // If a cart is found in localStorage, parse it from JSON text to an array.
      // Otherwise, start with an empty array.
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return []; // Start with an empty cart if data is corrupted.
    }
  });

  // EFFECT 1: This effect synchronizes the 'cartItems' state WITH localStorage.
  // It runs every time the cartItems array changes.
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // EFFECT 2: This effect listens for changes in the user's authentication state.
  // It runs every time the 'user' object changes.
  useEffect(() => {
    // If the user becomes null (meaning they logged out), clear the cart state.
    if (!user) {
      setCartItems([]);
    }
  }, [user]);

  // --- CART MANAGEMENT FUNCTIONS (STABILIZED WITH useCallback) ---

  // useCallback memoizes the function definition so it isn't recreated on every render.
  // This prevents unnecessary re-renders in child components that depend on these functions.
  
  const addToCart = useCallback((product, quantityToAdd = 1) => {
    // Safety check for the product object.
    if (!product || !product.name || typeof product.stock === 'undefined') {
      console.error("addToCart was called with an invalid product object:", product);
      toast.error("An error occurred while adding the item to the cart.");
      return;
    }

    const existingItem = cartItems.find(item => item.id === product.id);
    const quantityInCart = existingItem ? existingItem.quantity : 0;

    // Stock Validation: Check if the desired quantity exceeds available stock.
    if (quantityInCart + quantityToAdd > product.stock) {
      toast.warn(`Cannot add more of "${product.name}". Only ${product.stock - quantityInCart} left in stock.`);
      return;
    }

    if (existingItem) {
      // If item exists, update its quantity.
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
        )
      );
    } else {
      // If it's a new item, add it to the cart.
      setCartItems(prevItems => [...prevItems, { ...product, quantity: quantityToAdd }]);
    }
    
    // Provide clear user feedback.
    toast.success(`${quantityToAdd} x ${product.name} has been added to the cart!`);
  }, [cartItems]); // Dependency: Recreate function if cartItems changes to get the latest state.

  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast.info("Item removed from cart.");
  }, []); // No dependencies, this function never needs to change.

  const updateQuantity = useCallback((productId, newQuantity) => {
    setCartItems(prevItems => {
      const itemToUpdate = prevItems.find(item => item.id === productId);
      if (!itemToUpdate) return prevItems; // Item not found, do nothing.

      // Stock validation.
      if (newQuantity > itemToUpdate.stock) {
        toast.warn(`Only ${itemToUpdate.stock} of "${itemToUpdate.name}" in stock.`);
        return prevItems; // Return previous items without change.
      }
      
      // If new quantity is less than 1, remove the item.
      if (newQuantity < 1) {
        return prevItems.filter(item => item.id !== productId);
      }
      
      // Otherwise, update the quantity of the specific item.
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []); // No dependencies, this function never needs to change.

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.info("Cart has been cleared.");
  }, []); // No dependencies, this function never needs to change.

  // useMemo optimizes the context value object. It will only be re-created if
  // one of its dependencies (cartItems or one of the functions) changes.
  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [cartItems, addToCart, removeFromCart, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// 3. Create a custom hook for easy access to the context from any component.
export function useCart() {
  const context = useContext(CartContext);
  // This check ensures that any component using this hook is a child of CartProvider.
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}