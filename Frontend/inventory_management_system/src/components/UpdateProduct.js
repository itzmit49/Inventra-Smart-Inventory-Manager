import React, { useEffect, useState, useContext } from 'react'
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * UpdateProduct Component - Form for editing product information
 * Includes stock tracking fields (quantity and lowStockThreshold)
 * Protected route - requires user to be authenticated
 */
export default function UpdateProduct() {
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [productBarcode, setProductBarcode] = useState("");
    const [quantity, setQuantity] = useState("0");
    const [lowStockThreshold, setLowStockThreshold] = useState("10");
    const [loading, setLoading] = useState(false);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate("");
    const { token } = useContext(AuthContext);
    const { id } = useParams("");

    const setName = (e) => {
        setProductName(e.target.value);
    };
    
    const setPrice = (e) => {
        setProductPrice(e.target.value);
    };
    
    const setBarcode = (e) => {
        const value = e.target.value.slice(0, 12);
        setProductBarcode(value);
    };

    const setStockQuantity = (e) => {
        const value = Math.max(0, parseInt(e.target.value) || 0);
        setQuantity(value.toString());
    };

    const setStockThreshold = (e) => {
        const value = Math.max(0, parseInt(e.target.value) || 10);
        setLowStockThreshold(value.toString());
    };

    useEffect(() => {
        const getProduct = async () => {
            setLoadingInitial(true);
            try {
                const res = await fetch(`http://localhost:3001/products/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
        
                const data = await res.json();
        
                if (res.status === 200 || res.status === 201) {
                    console.log("Product loaded:", data);
                    setProductName(data.ProductName);
                    setProductPrice(data.ProductPrice.toString());
                    setProductBarcode(data.ProductBarcode.toString());
                    setQuantity((data.quantity || 0).toString());
                    setLowStockThreshold((data.lowStockThreshold || 10).toString());
                } else {
                    setError("Failed to load product. Please try again.");
                }
            } catch (err) {
                console.log(err);
                setError("An error occurred while loading the product.");
            } finally {
                setLoadingInitial(false);
            }
        };

        if (id && token) {
            getProduct();
        }
    }, [id, token]);

    /**
     * Updates product data with authentication token
     */
    const updateProduct = async (e) => {
        e.preventDefault();

        if (!productName || !productPrice || !productBarcode) {
            setError("*Please fill in all required fields (Name, Price, Barcode).");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(`http://localhost:3001/updateproduct/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    "ProductName": productName,
                    "ProductPrice": parseFloat(productPrice),
                    "ProductBarcode": parseInt(productBarcode),
                    "quantity": parseInt(quantity) || 0,
                    "lowStockThreshold": parseInt(lowStockThreshold) || 10
                })
            });

            const data = await response.json();

            if (response.status === 201) {
                alert("Product updated successfully!");
                navigate('/products');
            }
            else {
                setError(data.message || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again later.");
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    if (loadingInitial) {
        return (
            <div className='container-fluid p-lg-5 p-3 d-flex justify-content-center align-items-center' style={{ minHeight: '90vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className='container-fluid p-lg-5 p-3' style={{ backgroundColor: '#F8FAFB', minHeight: '90vh' }}>
            <div className='row justify-content-center'>
                <div className='col-lg-8 col-md-10 col-12'>
                    <h1 className='mb-5 fw-bold' style={{ color: '#1E3A5F' }}>Edit Product</h1>
             
                    <div className="card border-0 shadow-sm p-4">
                        {/* Product Name */}
                        <div className="mb-4">
                            <label htmlFor="product_name" className="form-label fw-bold" style={{ color: '#1A202C' }}>
                                Product Name
                            </label>
                            <input 
                                type="text" 
                                onChange={setName} 
                                value={productName} 
                                className="form-control form-control-lg" 
                                id="product_name" 
                                placeholder="Enter product name" 
                                required 
                                style={{ borderColor: '#E0E7FF' }}
                            />
                        </div>

                        {/* Product Price */}
                        <div className="mb-4">
                            <label htmlFor="product_price" className="form-label fw-bold" style={{ color: '#1A202C' }}>
                                Product Price (₹)
                            </label>
                            <input 
                                type="number" 
                                step="0.01"
                                onChange={setPrice} 
                                value={productPrice} 
                                className="form-control form-control-lg" 
                                id="product_price" 
                                placeholder="Enter product price" 
                                required 
                                style={{ borderColor: '#E0E7FF' }}
                            />
                        </div>

                        {/* Product Barcode */}
                        <div className="mb-4">
                            <label htmlFor="product_barcode" className="form-label fw-bold" style={{ color: '#1A202C' }}>
                                Product Barcode
                            </label>
                            <input 
                                type="number" 
                                onChange={setBarcode} 
                                value={productBarcode} 
                                maxLength={12} 
                                className="form-control form-control-lg" 
                                id="product_barcode" 
                                placeholder="Enter 12-digit barcode" 
                                required 
                                style={{ borderColor: '#E0E7FF' }}
                            />
                        </div>

                        {/* Stock Quantity */}
                        <div className="mb-4">
                            <label htmlFor="quantity" className="form-label fw-bold" style={{ color: '#1A202C' }}>
                                Current Stock Quantity
                            </label>
                            <input 
                                type="number" 
                                onChange={setStockQuantity} 
                                value={quantity} 
                                className="form-control form-control-lg" 
                                id="quantity" 
                                placeholder="Update stock quantity" 
                                min="0"
                                style={{ borderColor: '#E0E7FF' }}
                            />
                        </div>

                        {/* Low Stock Threshold */}
                        <div className="mb-5">
                            <label htmlFor="lowStockThreshold" className="form-label fw-bold" style={{ color: '#1A202C' }}>
                                Low Stock Alert Threshold
                            </label>
                            <input 
                                type="number" 
                                onChange={setStockThreshold} 
                                value={lowStockThreshold} 
                                className="form-control form-control-lg" 
                                id="lowStockThreshold" 
                                placeholder="Update threshold" 
                                min="0"
                                style={{ borderColor: '#E0E7FF' }}
                            />
                            <small className="text-muted d-block mt-2">
                                ℹ️ Product shows "Low Stock" when quantity ≤ {lowStockThreshold}
                            </small>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="alert alert-danger mb-4 border-0" role="alert">
                                <strong>⚠️ Error:</strong> {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className='d-flex justify-content-center gap-3 flex-wrap'>
                            <NavLink 
                                to="/products" 
                                className='btn btn-lg' 
                                style={{
                                    backgroundColor: '#CBD5E0', 
                                    color: '#1A202C',
                                    fontWeight: '600',
                                    minWidth: '140px'
                                }}
                            >
                                Cancel
                            </NavLink>
                            <button 
                                type="submit" 
                                onClick={updateProduct} 
                                className="btn btn-lg" 
                                style={{
                                    background: 'linear-gradient(135deg, #16A085 0%, #138d75 100%)',
                                    color: 'white',
                                    fontWeight: '600',
                                    minWidth: '140px'
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Product'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
