// =================================================================
// FILE: RegisterPage.jsx (FULL VERSION WITH TOASTS & STYLING)
// =================================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
import styles from './AuthForm.module.css';
import axiosInstance from '../api/axiosInstance'; // Correctly import axiosInstance

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Use axiosInstance to make the request to the correct backend URL
      const response = await axiosInstance.post('/api/register', {
        username,
        email,
        password,
      });

      const data = response.data;

      // Use the success message from the server if available
      toast.success(data.message || 'Account created successfully! Please log in.');
      navigate('/login');

    } catch (err) {
      console.error('Registration error:', err);
      // Display a more specific error message from the server if available
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create account';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Create a New Account</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="username">Username:</label>
          <input
            className={styles.formInput}
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address:</label>
          <input
            className={styles.formInput}
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            className={styles.formInput}
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className={styles.switchFormLink}>
        Already have an account? <Link to="/login">Login here</Link>.
      </p>
    </div>
  );
}

export default RegisterPage;
