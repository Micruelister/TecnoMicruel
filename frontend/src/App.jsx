// =================================================================
// FILE: App.jsx (FINAL VERSION WITH GOOGLE MAPS SCRIPT LOADER)
// =================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';

// --- Toastify Imports ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Layout & Auth Components ---
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// --- Page Components ---
import HomePage from './pages/HomePage.jsx';
import CartPage from './pages/CartPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import MyAccountPage from './pages/MyAccountPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderSuccessPage from './pages/OrderSuccessPage.jsx';
import OrderCancelPage from './pages/OrderCancelPage.jsx';
import ManageInventoryPage from './pages/ManageInventoryPage.jsx';
import CreateProductPage from './pages/CreateProductPage.jsx';
import EditProductPage from './pages/EditProductPage.jsx';
import ManageOrdersPage from './pages/ManageOrdersPage.jsx';

// --- Configuration ---

// Load the Google Maps API Key from environment variables.
// Vite requires the 'VITE_' prefix for variables to be exposed to the frontend.
const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Define which libraries from Google Maps we want to load.
// 'places' is required for the Autocomplete functionality.
const libraries = ['places'];

// The App component is the root of our application.
function App() {
  if (!googleMapsApiKey) {
    return <div>Error: Google Maps API Key is missing. Please check your .env file.</div>;
  }
  return (
    // The LoadScript component from @react-google-maps/api handles loading
    // the Google Maps JavaScript API. We wrap our entire app with it so that
    // the API is available to any component that needs it, but it only loads once.
    <LoadScript
      googleMapsApiKey={googleMapsApiKey}
      libraries={libraries}
      version= "beta"
    >
      <BrowserRouter>
        <div className="app-container">
          <Navbar /> 
          
          <main className="main-content">
            <ToastContainer
              position="bottom-right"
              autoClose={4000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />

            <Routes>
              {/* --- PUBLIC ROUTES --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/order/cancel" element={<OrderCancelPage />} />

              {/* --- PROTECTED USER ROUTES --- */}
              <Route element={<ProtectedRoute />}>
                <Route path="/my-account" element={<MyAccountPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order/success" element={<OrderSuccessPage />} />
              </Route>

              {/* --- PROTECTED ADMIN ROUTES --- */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/admin/inventory" element={<ManageInventoryPage />} />
                <Route path="/admin/product/new" element={<CreateProductPage />} />
                <Route path="/admin/product/edit/:id" element={<EditProductPage />} />
                <Route path="/admin/orders" element={<ManageOrdersPage />} />
              </Route>
              
            </Routes>
          </main>
          
          <Footer />
        </div>
      </BrowserRouter>
    </LoadScript>
  );
}

export default App;