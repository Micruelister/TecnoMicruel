// =================================================================
// FILE: App.jsx (REFACTORED - NO GOOGLE MAPS DEPENDENCIES)
// =================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';

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

// The App component is the root of our application.
function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        
        <main className="main-content">
          <ToastContainer
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
ax
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
  );
}

export default App;
