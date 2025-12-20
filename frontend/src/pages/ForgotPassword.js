import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSubmitted(true);
    } catch (err) {
      // Always show success message for security
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Reset Password
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {submitted 
              ? 'Check your email for reset instructions' 
              : 'Enter your email to receive a password reset link'
            }
          </p>
        </div>

        {submitted ? (
          <div>
            <div style={{
              background: '#D1FAE5',
              color: '#065F46',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontWeight: '500' }}>✅ If an account exists with this email, you will receive a password reset link shortly.</p>
            </div>
            <Link
              to="/login"
              style={{
                display: 'block',
                width: '100%',
                padding: '14px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                textAlign: 'center',
                textDecoration: 'none',
                boxSizing: 'border-box'
              }}
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: '#FEE2E2',
                color: '#DC2626',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="your@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <Link
              to="/login"
              style={{
                display: 'block',
                textAlign: 'center',
                color: '#667eea',
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
