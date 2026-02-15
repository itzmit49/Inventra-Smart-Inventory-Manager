import React, { useEffect, useState, useContext } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

/**
 * Stock Status Helper Function
 * Determines the stock status based on quantity and threshold
 */
const getStockStatus = (quantity, lowStockThreshold) => {
    if (quantity === 0) {
        return { status: 'OUT_OF_STOCK', label: 'Out of Stock', color: '#DC2626', bgColor: '#FEE2E2' };
    } else if (quantity <= lowStockThreshold) {
        return { status: 'LOW_STOCK', label: 'Low Stock', color: '#EA580C', bgColor: '#FED7AA' };
    } else {
        return { status: 'IN_STOCK', label: 'In Stock', color: '#16A085', bgColor: '#D1F4E8' };
    }
};

/**
 * Products Component - Stock Tracking System
 * Displays all user products with inventory levels and status
 * Shows search functionality and CRUD actions for authenticated users
 */
export default function Products() {

    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';
    const { token } = useContext(AuthContext);

    useEffect(() => {
        getProducts();
    }, [token])

    const [productData, setProductData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Fetches all products for the logged-in user - PROTECTED endpoint
     */
    const getProducts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("https://inventra-smart-inventory-manager-backend-yrr0.onrender.com/products", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.status === 200 || res.status === 201) {
                console.log("Products loaded:", data);
                setProductData(data);
            }
            else {
                console.log("Error fetching products");
                setProductData([]);
            }
        } catch (err) {
            console.log(err);
            setProductData([]);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Deletes a product by ID - PROTECTED endpoint
     */
    const deleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`https://inventra-smart-inventory-manager-backend-yrr0.onrender.com/deleteproduct/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const deletedata = await response.json();
            console.log(deletedata);

            if (response.status === 200) {
                alert("Product deleted successfully.");
                getProducts();
            } else {
                alert(deletedata.message || "Error deleting product.");
            }
        } catch (err) {
            console.log(err);
            alert("An error occurred while deleting the product.");
        }
    }

    // Filter products based on search query
    const filteredProducts = productData.filter((product) =>
        product.ProductName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate inventory statistics
    const stats = {
        total: productData.length,
        inStock: productData.filter(p => p.quantity > p.lowStockThreshold).length,
        lowStock: productData.filter(p => p.quantity <= p.lowStockThreshold && p.quantity > 0).length,
        outOfStock: productData.filter(p => p.quantity === 0).length
    };

    return (
        <>
            <style>{`
                .inventory-badge {
                    display: inline-block;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    white-space: nowrap;
                }

                .low-stock-row {
                    background-color: rgba(254, 215, 170, 0.3);
                    border-left: 4px solid #EA580C;
                }

                .out-of-stock-row {
                    background-color: rgba(254, 226, 226, 0.3);
                    border-left: 4px solid #DC2626;
                    opacity: 0.85;
                }

                .stats-card {
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    margin-bottom: 20px;
                }

                .stats-item {
                    text-align: center;
                    padding: 0 15px;
                }

                .stats-number {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }

                .stats-label {
                    font-size: 0.9rem;
                    color: #6B7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .table-responsive-custom {
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
                }

                .table thead {
                    background: linear-gradient(135deg, #1E3A5F 0%, #153d5f 100%);
                    color: white;
                }

                .table thead th {
                    border: none;
                    font-weight: 600;
                    padding: 15px;
                    vertical-align: middle;
                }

                .table tbody td {
                    vertical-align: middle;
                    padding: 15px;
                    border-bottom: 1px solid #E5E7EB;
                }

                .table tbody tr:hover {
                    background-color: rgba(22, 160, 133, 0.04);
                }

                .action-btn-group {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                @media (max-width: 768px) {
                    .stats-item {
                        padding: 0;
                        margin-bottom: 15px;
                    }

                    .table {
                        font-size: 0.9rem;
                    }

                    .table thead th,
                    .table tbody td {
                        padding: 10px;
                    }

                    .action-btn-group {
                        flex-direction: column;
                    }

                    .action-btn-group .btn {
                        width: 100%;
                    }
                }
            `}</style>

            <div className='container-fluid px-3 px-lg-5 py-5' style={{ backgroundColor: '#F8FAFB', minHeight: '100vh' }}>
                
                {/* Header */}
                <div className='d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3'>
                    <div>
                        <h1 className='fw-bold mb-2' style={{ color: '#1E3A5F' }}>📊 Stock Inventory</h1>
                        {searchQuery && (
                            <p className="text-muted mb-0">
                                🔍 Results for: <strong>"{searchQuery}"</strong>
                            </p>
                        )}
                    </div>
                    <NavLink 
                        to="/insertproduct" 
                        className='btn btn-lg' 
                        style={{
                            background: 'linear-gradient(135deg, #16A085 0%, #138d75 100%)',
                            color: 'white',
                            fontWeight: '600',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        ➕ Add Product
                    </NavLink>
                </div>

                {/* Statistics Cards */}
                <div className='stats-card' style={{ backgroundColor: 'white', borderTop: '4px solid #16A085' }}>
                    <div className='row'>
                        <div className='col-md-3 col-6 stats-item'>
                            <div className='stats-number' style={{ color: '#1E3A5F' }}>{stats.total}</div>
                            <div className='stats-label'>Total Products</div>
                        </div>
                        <div className='col-md-3 col-6 stats-item'>
                            <div className='stats-number' style={{ color: '#16A085' }}>{stats.inStock}</div>
                            <div className='stats-label'>In Stock</div>
                        </div>
                        <div className='col-md-3 col-6 stats-item'>
                            <div className='stats-number' style={{ color: '#EA580C' }}>{stats.lowStock}</div>
                            <div className='stats-label'>Low Stock</div>
                        </div>
                        <div className='col-md-3 col-6 stats-item'>
                            <div className='stats-number' style={{ color: '#DC2626' }}>{stats.outOfStock}</div>
                            <div className='stats-label'>Out of Stock</div>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className='table-responsive-custom'>
                    <table className="table table-hover mb-0">
                        <thead>
                            <tr>
                                <th scope="col" style={{ width: '5%' }} className="d-none d-md-table-cell">#</th>
                                <th scope="col" style={{ width: '20%' }}>Product Name</th>
                                <th scope="col" style={{ width: '12%' }} className="d-none d-lg-table-cell">Price</th>
                                <th scope="col" style={{ width: '12%' }} className="d-none d-lg-table-cell">Barcode</th>
                                <th scope="col" style={{ width: '13%', textAlign: 'center' }}>Quantity</th>
                                <th scope="col" style={{ width: '15%', textAlign: 'center' }}>Status</th>
                                <th scope="col" style={{ width: '23%', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((element, id) => {
                                    const stockStatus = getStockStatus(element.quantity, element.lowStockThreshold);
                                    const rowClass = element.quantity === 0 ? 'out-of-stock-row' : element.quantity <= element.lowStockThreshold ? 'low-stock-row' : '';

                                    return (
                                        <tr key={element._id} className={rowClass}>
                                            <th scope="row" className="d-none d-md-table-cell fw-normal text-muted">{id + 1}</th>
                                            <td className='fw-500'>
                                                <strong>{element.ProductName}</strong>
                                            </td>
                                            <td className="d-none d-lg-table-cell">
                                                <strong>₹{parseFloat(element.ProductPrice).toFixed(2)}</strong>
                                            </td>
                                            <td className="d-none d-lg-table-cell text-muted">{element.ProductBarcode}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <strong style={{ fontSize: '1.1rem' }}>
                                                    {element.quantity}
                                                </strong>
                                                <br />
                                                <small className="text-muted">
                                                    Threshold: {element.lowStockThreshold}
                                                </small>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span 
                                                    className='inventory-badge'
                                                    style={{
                                                        color: stockStatus.color,
                                                        backgroundColor: stockStatus.bgColor,
                                                        border: `2px solid ${stockStatus.color}`
                                                    }}
                                                >
                                                    {stockStatus.status === 'OUT_OF_STOCK' && '🚫'}
                                                    {stockStatus.status === 'LOW_STOCK' && '⚠️'}
                                                    {stockStatus.status === 'IN_STOCK' && '✅'}
                                                    {` ${stockStatus.label}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div className='action-btn-group'>
                                                    <NavLink 
                                                        to={`/updateproduct/${element._id}`} 
                                                        className="btn btn-sm"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #16A085 0%, #138d75 100%)',
                                                            color: 'white',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        ✏️ Edit
                                                    </NavLink>
                                                    <button 
                                                        className="btn btn-sm"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
                                                            color: 'white',
                                                            fontWeight: '600',
                                                            border: 'none'
                                                        }}
                                                        onClick={() => deleteProduct(element._id)}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted py-5">
                                        <p style={{ fontSize: '1.1rem' }}>
                                            {searchQuery 
                                                ? `❌ No products found matching "${searchQuery}"` 
                                                : '📦 No products in inventory yet. Click "Add Product" to get started!'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
