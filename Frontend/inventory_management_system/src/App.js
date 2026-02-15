import './App.css';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Products from './components/Products';
import InsertProduct from './components/InsertProduct'
import UpdateProduct from './components/UpdateProduct';
import InvoiceGenerator from './components/InvoiceGenerator';
import SalesHistory from './components/SalesHistory';
import SalesAnalytics from './components/SalesAnalytics';
import About from './components/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

document.documentElement.style.setProperty('--primary-color', '#16A085');
document.documentElement.style.setProperty('--secondary-color', '#1E3A5F');
document.documentElement.style.setProperty('--dark-color', '#0F2340');
document.documentElement.style.setProperty('--light-bg', '#F8FAFB');
document.documentElement.style.setProperty('--text-dark', '#1A202C');


function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Navbar title="HOME" about="About"></Navbar>

          <Routes>
            {/* Public Routes */}
            <Route exact path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />

            {/* Protected Routes - Require Authentication */}
            <Route path="/products" element={<ProtectedRoute element={<Products />} />} />
            <Route path="/insertproduct" element={<ProtectedRoute element={<InsertProduct />} />} />
            <Route path="/updateproduct/:id" element={<ProtectedRoute element={<UpdateProduct />} />} />
            <Route path="/invoice" element={<ProtectedRoute element={<InvoiceGenerator />} />} />
            <Route path="/sales-history" element={<ProtectedRoute element={<SalesHistory />} />} />
            <Route path="/sales-analytics" element={<ProtectedRoute element={<SalesAnalytics />} />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
