// =================================================================
// FILE: CheckoutPage.jsx (REFACTORED FOR OPENSTREETMAP)
// =================================================================

import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import axiosInstance from '../api/axiosInstance.js';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { getAlpha2Code as getCountryCodeByName } from 'iso-country-converter';

import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; 
import FormField from '../components/forms/FormFields.jsx';

// --- Component Imports (Updated) ---
import OpenStreetMapAutocomplete from '../components/forms/OpenStreetMapAutocomplete.jsx';
import styles from './CheckoutPage.module.css';
import '../App.css';

// --- Helper Function for Phone Input ---
function getCountryCode(countryName) {
  if (!countryName) return undefined;
  try {
    // 'en' specifies to look up the country by its English name.
    return getCountryCodeByName(countryName, 'en');
  } catch (error) {
    // This can happen if the country name from the API doesn't match the library's data.
    console.warn(`Could not find ISO code for country: ${countryName}`);
    return undefined;
  }
}

function CheckoutPage() {
  // --- STATE MANAGEMENT ---
  const { cartItems } = useCart();
  const { user } = useAuth();
  
  const [address, setAddress] = useState({
    fullName: user?.username || '',
    streetAddress: '',
    apartmentSuite: '', // This one is optional
    city: '',
    postalCode: '',
    country: '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [loading, setLoading] = useState(false);
  
  // Memoized country code for the phone input component.
  const countryCode = useMemo(() => {
    return getCountryCode(address.country);
  }, [address.country]);

  // --- EVENT HANDLERS ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (value) => {
    setAddress(prev => ({ ...prev, phoneNumber: value }));
  };

  // --- REFACTORED: Handles address selection from OpenStreetMapAutocomplete ---
  const handleAddressSelect = (details) => {
    if (!details) return;

    // Combine name (e.g., house number or POI) and street for a full street address.
    const streetAddress = [details.name, details.street].filter(Boolean).join(' ');

    setAddress(prev => ({
      ...prev,
      streetAddress: streetAddress,
      city: details.city || '',
      postalCode: details.postcode || '',
      country: details.country || '',
    }));
  };

  const handleCheckout = async () => {
    // 1. Validate phone number first.
    if (address.phoneNumber && !isValidPhoneNumber(address.phoneNumber)) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    // 2. Validate all required fields (everything except apartmentSuite).
    const fieldsToValidate = { ...address };
    delete fieldsToValidate.apartmentSuite; 

    for (const key in fieldsToValidate) {
      if (!fieldsToValidate[key]) {
        const fieldName = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        toast.error(`Please fill in the '${fieldName}' field.`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/create-checkout-session', {
        cartItems,
        shippingAddress: address,
      });
      window.location.href = response.data.url;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Checkout failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER LOGIC ---
  const totalPrice = useMemo(() => 
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  , [cartItems]);

  if (cartItems.length === 0) {
    return (
      <main className="container" style={{textAlign: 'center'}}>
        <h2>Checkout</h2>   
        <p>Your cart is empty. There is nothing to check out.</p>
        <Link to="/">Continue Shopping</Link>
      </main>
    );
  }

  return (
    <main className="container">
      <h2>Confirm Your Order</h2>
      <div className={styles.checkoutLayout}>
        <div className={styles.orderDetails}>
          <h3>Shipping Information</h3>
          <div className={styles.addressForm}>
            <FormField
              label="Full Name"
              id="fullName"
              name="fullName"
              value={address.fullName}
              onChange={handleInputChange}
              required
            />
            {/* --- UPDATED: Using the new OpenStreetMap component --- */}
            <div className={styles.formGroup}>
              <label htmlFor="streetAddress">Street Address</label>
              <OpenStreetMapAutocomplete onSelect={handleAddressSelect} />
            </div>
            <div className={styles.formRow}>
              <FormField
                label="City"
                id="city"
                name="city"
                value={address.city}
                onChange={handleInputChange}
                required
              />
              <FormField
                label="Postal Code"
                id="postalCode"
                name="postalCode"
                value={address.postalCode}
                onChange={handleInputChange}
                required
              />
            </div>
            <FormField
              label="Country"
              id="country"
              name="country"
              value={address.country}
              onChange={handleInputChange}
              required
            />
            <div className={styles.formGroup}>
              <label htmlFor="phoneNumber">Phone Number</label>
              <PhoneInput
                id="phoneNumber"
                country={countryCode} // Automatically sets the country flag
                value={address.phoneNumber}
                onChange={handlePhoneChange}
                className={styles.phoneInput}
                required
              />
            </div>
          </div>
          <hr />
          <h3>Order Items</h3>
          {cartItems.map(item => (
            <div key={item.id} className={styles.item}>
              <span>{item.name} (x{item.quantity})</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className={styles.orderSummary}>
          <h3>Order Summary</h3>
          <div className={styles.summaryLine}>
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout} disabled={loading} className={styles.payButton}>
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;
