import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 10) {
      setError('Password must be at least 10 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: password
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
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
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#DC2626', marginBottom: '16px' }}>Invalid Reset Link</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" style={{ color: '#667eea' }}>Request a new link</Link>
        </div>
      </div>
    );
  }

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
            Set New Password
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Enter your new password below
          </p>
        </div>

        {success ? (
          <div>
            <div style={{
              background: '#D1FAE5',
              color: '#065F46',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontWeight: '500' }}>✅ Password reset successful!</p>
              <p style={{ margin: '8px 0 0', fontSize: '14px' }}>Redirecting to login...</p>
            </div>
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
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Min 10 characters"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div style={{ 
              marginBottom: '20px', 
              padding: '12px', 
              background: '#F3F4F6', 
              borderRadius: '8px',
              fontSize: '13px',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>Password requirements:</p>
              <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
                <li>At least 10 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one lowercase letter</li>
                <li>At least one number</li>
              </ul>
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
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
