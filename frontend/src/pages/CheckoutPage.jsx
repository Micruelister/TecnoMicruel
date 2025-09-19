// =================================================================
// FILE: CheckoutPage.jsx (ABSOLUTELY 100% COMPLETE - FINAL VERSION)
// =================================================================

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import axiosInstance from '../api/axiosInstance.js';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { getAlpha2Code as getCountryCodeByName } from 'iso-country-converter';

import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; 
import FormField from '../components/forms/FormFields.jsx';

// --- Component Imports ---
import GooglePlacesAutocomplete from '../components/forms/GooglePlacesAutocomplete.jsx';
import styles from './CheckoutPage.module.css';
import '../App.css';

// --- Helper Function ---
// Extracts a specific address component from the Google Geocode result.
const extractAddressComponent = (components, type, short = false) => {
  const component = components.find(c => c.types.includes(type));
  if (!component) return '';
  return short ? component.short_name : component.long_name;
};

function getCountryCode(countryName) {
  if (!countryName) return undefined;
  try {
    return getCountryCodeByName(countryName, 'en');
  } catch (error) {
    console.warn(`Could not find ISO code for country: ${countryName}`, error);
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
    apartmentSuite: '',
    city: '',
    postalCode: '',
    country: '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [loading, setLoading] = useState(false);
  const countryCode = useMemo(() => {
    return getCountryCode(address.country);
  }, [address.country]);

  // --- EVENT HANDLERS ---

  // Handles manual changes to the form inputs.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };
    const handlePhoneChange = (value) => {
    setAddress(prev => ({ ...prev, phoneNumber: value }));
  };
  // Handles the selection of an address from the Google Autocomplete dropdown.
const handleAddressSelect = (placeId) => {
    if (!placeId) return;
    if (!window.google || !window.google.maps) return;
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails({ placeId, fields: ['address_components', 'name'] }, (place, status) => {
      if (status === 'OK' && place && place.address_components) {
        const components = place.address_components;
        const streetNumber = extractAddressComponent(components, 'street_number');
        const route = extractAddressComponent(components, 'route');
        const formattedStreetAddress = [streetNumber, route].filter(Boolean).join(' ');
        
        setAddress(prev => ({
          ...prev,
          streetAddress: formattedStreetAddress || place.name,
          city: extractAddressComponent(components, 'locality'),
          postalCode: extractAddressComponent(components, 'postal_code'),
          country: extractAddressComponent(components, 'country'),
        }));
      } else {
        console.error('PlacesService getDetails failed:', status);
        toast.warn("Could not auto-fill address details. Please fill fields manually.");
      }
    });
  }

  // Handles the final checkout submission to our backend.
const handleCheckout = async () => {
  // --- LÓGICA CORREGIDA ---
  
  // 1. Primero, validamos el número de teléfono por separado
  if (address.phoneNumber && !isValidPhoneNumber(address.phoneNumber)) {
    toast.error("Please enter a valid phone number.");
    return;
  }

  // 2. Creamos una copia del objeto de dirección para la validación
  const fieldsToValidate = { ...address };
  // Eliminamos el campo opcional para que no sea requerido
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
  if (cartItems.length === 0) {
    return (
      <main className="container" style={{textAlign: 'center'}}>
        <h2>Checkout</h2>   
        <p>Your cart is empty. There is nothing to check out.</p>
        <Link to="/">Continue Shopping</Link>
      </main>
    );
  }
  const totalPrice = useMemo(() => {
  console.log("Calculating total price...");
  return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

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
          <div className={styles.formGroup}>
            <label htmlFor="streetAddress">Street Address</label>
            <GooglePlacesAutocomplete onSelect={handleAddressSelect} />
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
                country={countryCode}
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