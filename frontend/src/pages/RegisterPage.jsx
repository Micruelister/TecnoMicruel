// =================================================================
// FILE: RegisterPage.jsx (FULL VERSION WITH TOASTS & STYLING)
// =================================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast
import styles from './AuthForm.module.css';

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
      const response = await fetch('http://127.0.0.1:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      toast.success('Account created successfully! Please log in.');
      navigate('/login');

    } catch (err) {
      console.error('Registration error:', err);
      // Display error using toast instead of alert
      toast.error(err.message);
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