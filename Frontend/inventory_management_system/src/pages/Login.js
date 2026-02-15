import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Call login function
    const result = await login(formData);

    if (result.success) {
      // Redirect to products page on successful login
      navigate('/products');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F8FAFB' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              borderRadius: '12px'
            }}>
              <div className="card-body p-5">
                <h1 className="text-center mb-4" style={{ color: '#1E3A5F', fontSize: '2rem' }}>
                  Welcome Back
                </h1>

                <p className="text-center text-muted mb-4">Sign in to manage your inventory</p>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-bold">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      style={{
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        padding: '0.75rem'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-bold">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      style={{
                        borderColor: '#E2E8F0',
                        borderRadius: '8px',
                        padding: '0.75rem'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100"
                    disabled={loading}
                    style={{
                      backgroundColor: '#16A085',
                      borderColor: '#16A085',
                      color: 'white',
                      fontWeight: '600',
                      padding: '0.75rem',
                      borderRadius: '8px'
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>

                <hr className="my-4" />

                <p className="text-center">
                  Don't have an account?{' '}
                  <Link to="/signup" style={{ color: '#16A085', fontWeight: '600' }}>
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
