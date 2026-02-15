import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Navbar(props) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useContext(AuthContext);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  return (
    <>
      <style>{`
        /* ===== NAVBAR STYLING ===== */
        .navbar-custom {
          background: linear-gradient(135deg, #1E3A5F 0%, #153d5f 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          padding: 0.8rem 0;
        }

        .navbar-brand-custom {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: 1px;
          background: linear-gradient(90deg, #FFFFFF 0%, #A0F4E8 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease infinite;
          transition: transform 0.3s ease;
        }

        .navbar-brand-custom:hover {
          transform: scale(1.05);
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* ===== NAVIGATION LINKS ===== */
        .nav-link-custom {
          color: #E8EAED !important;
          font-weight: 500;
          font-size: 0.95rem;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          padding: 8px 12px;
        }

        .nav-link-custom::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #16A085, #A0F4E8);
          transition: width 0.3s ease;
        }

        .nav-link-custom:hover {
          color: #A0F4E8 !important;
          transform: translateY(-2px);
        }

        .nav-link-custom:hover::after {
          width: 100%;
        }

        /* ===== BUTTONS ===== */
        .nav-btn {
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Login Button */
        .login-btn {
          background: linear-gradient(135deg, #16A085 0%, #138d75 100%);
          color: white;
        }

        .login-btn:hover {
          background: linear-gradient(135deg, #138d75 0%, #0f6d57 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(22, 160, 133, 0.3);
        }

        .login-btn:active {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(22, 160, 133, 0.2);
        }

        /* Signup Button */
        .signup-btn {
          background: linear-gradient(135deg, #CBD5E0 0%, #a0aec0 100%);
          color: #1A202C;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .signup-btn:hover {
          background: linear-gradient(135deg, #a0aec0 0%, #8899b0 100%);
          color: #1A202C;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(160, 174, 192, 0.3);
        }

        .signup-btn:active {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(160, 174, 192, 0.2);
        }

        /* Logout Button */
        .logout-btn {
          background: linear-gradient(135deg, #E53E3E 0%, #C53030 100%);
          color: white;
        }

        .logout-btn:hover {
          background: linear-gradient(135deg, #C53030 0%, #A72E2E 100%);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(229, 62, 62, 0.3);
        }

        .logout-btn:active {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(229, 62, 62, 0.2);
        }

        /* Search Button */
        .search-btn {
          background: linear-gradient(135deg, #16A085 0%, #138d75 100%);
          color: white;
        }

        .search-btn:hover {
          background: linear-gradient(135deg, #138d75 0%, #0f6d57 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(22, 160, 133, 0.25);
        }

        /* ===== SEARCH BOX ===== */
        .search-box {
          border-radius: 10px;
          padding: 9px 14px;
          border: 1.5px solid #E0E7FF;
          background: rgba(255, 255, 255, 0.95);
          font-size: 0.9rem;
          transition: all 0.3s ease;
          color: #1A202C;
          min-width: 180px;
        }

        .search-box::placeholder {
          color: #9CA3AF;
        }

        .search-box:focus {
          outline: none;
          border-color: #16A085;
          background: white;
          box-shadow: 0 0 0 3px rgba(22, 160, 133, 0.15), 0 4px 12px rgba(22, 160, 133, 0.2);
          transform: translateY(-1px);
        }

        .search-box:hover {
          border-color: #A0F4E8;
        }

        /* ===== USER BADGE ===== */
        .user-badge {
          background: linear-gradient(135deg, rgba(160, 244, 232, 0.25), rgba(22, 160, 133, 0.15));
          border: 1.5px solid rgba(160, 244, 232, 0.4);
          padding: 8px 16px;
          border-radius: 24px;
          font-size: 0.9rem;
          color: #E8EAED;
          font-weight: 500;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
        }

        .user-badge:hover {
          background: linear-gradient(135deg, rgba(160, 244, 232, 0.35), rgba(22, 160, 133, 0.25));
          border-color: rgba(160, 244, 232, 0.6);
          box-shadow: 0 4px 16px rgba(22, 160, 133, 0.2);
          transform: translateY(-2px);
        }

        /* ===== RESPONSIVE STYLING ===== */
        @media (max-width: 991px) {
          .navbar-brand-custom {
            font-size: 1.4rem;
          }

          .search-box {
            min-width: 100%;
            margin-bottom: 8px;
          }

          .d-flex {
            flex-wrap: wrap;
            gap: 8px;
          }

          .nav-btn {
            padding: 8px 16px;
            font-size: 0.85rem;
          }

          .user-badge {
            width: 100%;
            justify-content: center;
            padding: 10px 12px;
          }
        }

        @media (max-width: 576px) {
          .navbar-brand-custom {
            font-size: 1.2rem;
            letter-spacing: 0.5px;
          }

          .nav-btn {
            padding: 7px 14px;
            font-size: 0.8rem;
          }

          .search-box {
            padding: 8px 12px;
            font-size: 0.85rem;
          }

          .user-badge {
            font-size: 0.85rem;
            padding: 8px 12px;
          }

          .navbar-collapse {
            padding-top: 0.5rem;
          }
        }

        /* ===== MISC ===== */
        .navbar-toggler {
          border-color: rgba(255, 255, 255, 0.3);
        }

        .navbar-toggler:focus {
          box-shadow: 0 0 0 0.25rem rgba(22, 160, 133, 0.25);
          border-color: #16A085;
        }

        .gap-2 {
          gap: 0.8rem;
        }

        @media (max-width: 991px) {
          .gap-2 {
            gap: 0.5rem;
          }
        }
      `}</style>

      <nav className="navbar navbar-expand-lg navbar-custom"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 999
        }}
      >
        <div className="container-fluid px-3 px-lg-4 py-2">

          <Link className="navbar-brand navbar-brand-custom me-4" to="/">
            {props.title}
          </Link>

          <button className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">

            {/* Navigation Links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 gap-lg-2">
              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/products">
                  Products
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/invoice">
                  📄 Invoice
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/sales-analytics">
                  📈 Analytics
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/sales-history">
                  📊 History
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/about">
                  About
                </Link>
              </li>

              {isAuthenticated() && user?.role === 'admin' && (
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/admin">
                    Admin Panel
                  </Link>
                </li>
              )}
            </ul>

            {/* Search Bar (Authenticated Users Only) */}
            {isAuthenticated() && (
              <form
                className="d-flex flex-column flex-lg-row gap-2 me-lg-3 mb-3 mb-lg-0"
                onSubmit={handleSearch}
              >
                <input
                  className="search-box"
                  type="text"
                  placeholder="Search product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search products"
                />
                <button type="submit" className="nav-btn search-btn">
                  🔍 Search
                </button>
              </form>
            )}

            {/* Auth Buttons & User Badge */}
            <div className="d-flex gap-2 align-items-lg-center flex-column flex-lg-row">
              {isAuthenticated() ? (
                <>
                  <div className="user-badge">
                    👤 <strong>{user?.name}</strong>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="nav-btn logout-btn w-100 w-lg-auto"
                  >
                    ⏻ Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-btn login-btn w-100 w-lg-auto justify-content-center">
                    🔐 Login
                  </Link>

                  <Link to="/signup" className="nav-btn signup-btn w-100 w-lg-auto justify-content-center">
                    ✏️ Signup
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>
    </>
  )
}
