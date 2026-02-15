import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const InvoiceGenerator = () => {
    const { token, user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [taxRate, setTaxRate] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [invoice, setInvoice] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // Fetch products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://inventra-smart-inventory-manager-backend-yrr0.onrender.com/products', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setProducts(Array.isArray(data) ? data : data.products || []);
        } catch (err) {
            setError('Failed to fetch products: ' + err.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle product selection
    const handleSelectProduct = (product) => {
        const existingItem = selectedItems.find((item) => item.productId === product._id);

        if (existingItem) {
            // Remove if already selected
            setSelectedItems(selectedItems.filter((item) => item.productId !== product._id));
        } else {
            // Add to selected items
            setSelectedItems([
                ...selectedItems,
                {
                    productId: product._id,
                    productName: product.ProductName,
                    unitPrice: product.ProductPrice,
                    quantity: 1,
                    maxQuantity: product.quantity,
                },
            ]);
        }
        setError('');
    };

    // Handle quantity change
    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity < 1) return;

        const item = selectedItems.find((i) => i.productId === productId);
        if (newQuantity > item.maxQuantity) {
            setError(`Cannot exceed available stock (${item.maxQuantity}) for ${item.productName}`);
            return;
        }

        setSelectedItems(
            selectedItems.map((item) =>
                item.productId === productId ? { ...item, quantity: newQuantity } : item
            )
        );
        setError('');
    };

    // Calculate totals
    const calculations = useCallback(() => {
        let subtotal = 0;
        selectedItems.forEach((item) => {
            subtotal += item.unitPrice * item.quantity;
        });

        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        return {
            subtotal: parseFloat(subtotal.toFixed(2)),
            taxAmount: parseFloat(taxAmount.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
        };
    }, [selectedItems, taxRate]);

    const { subtotal, taxAmount, total } = calculations();

    // Generate Invoice (Draft)
    const handleGenerateInvoice = async () => {
        if (selectedItems.length === 0) {
            setError('Please select at least one product');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('https://inventra-smart-inventory-manager-backend-yrr0.onrender.com/createinvoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    items: selectedItems.map(({ productId, quantity }) => ({
                        productId,
                        quantity,
                    })),
                    taxRate: parseFloat(taxRate),
                    notes,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setInvoice(data.invoice);
                setShowPreview(true);
                setSuccess('Invoice generated successfully!');
            } else {
                setError(data.message || 'Failed to generate invoice');
            }
        } catch (err) {
            setError('Error creating invoice: ' + err.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // Confirm Invoice & Deduct Stock
    const handleConfirmInvoice = async () => {
        if (!invoice) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`https://inventra-smart-inventory-manager-backend-yrr0.onrender.com/confirminvoice/${invoice._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                setInvoice(data.invoice);
                setSuccess('Invoice confirmed! Stock has been updated.');
            } else {
                setError(data.message || 'Failed to confirm invoice');
            }
        } catch (err) {
            setError('Error confirming invoice: ' + err.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // Print Invoice
    const handlePrintInvoice = async () => {
        if (!invoice) return;

        // Open print dialog
        window.print();

        // Optional: Mark as printed in database
        try {
            await fetch(`https://inventra-smart-inventory-manager-backend-yrr0.onrender.com/printinvoice/${invoice._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (err) {
            console.log('Error marking invoice as printed:', err);
        }
    };

    // Reset Bill
    const handleResetBill = () => {
        setSelectedItems([]);
        setTaxRate(0);
        setNotes('');
        setInvoice(null);
        setShowPreview(false);
        setError('');
        setSuccess('');
    };

    // Remove item from bill
    const handleRemoveItem = (productId) => {
        setSelectedItems(selectedItems.filter((item) => item.productId !== productId));
    };

    return (
        <div className="invoice-container" style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>📄 Invoice Generator</h1>
                <p style={styles.subtitle}>Create professional invoices for your products</p>
            </div>

            {/* Error & Success Messages */}
            {error && <div style={styles.alert('danger')}>{error}</div>}
            {success && <div style={styles.alert('success')}>{success}</div>}

            {!showPreview ? (
                <div className="row" style={{ marginTop: '2rem' }}>
                    {/* Product Selection */}
                    <div className="col-lg-6">
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>📦 Select Products</h3>
                            {loading && !products.length ? (
                                <div style={styles.spinner}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.productList}>
                                    {products.map((product) => {
                                        const isSelected = selectedItems.some(
                                            (item) => item.productId === product._id
                                        );
                                        const stockStatus =
                                            product.quantity === 0
                                                ? { label: 'Out of Stock', color: '#E74C3C' }
                                                : product.quantity <= product.lowStockThreshold
                                                ? { label: 'Low Stock', color: '#F39C12' }
                                                : { label: 'In Stock', color: '#27AE60' };

                                        return (
                                            <div
                                                key={product._id}
                                                style={{
                                                    ...styles.productItem,
                                                    borderLeft: isSelected ? `5px solid #16A085` : 'none',
                                                    backgroundColor: isSelected ? '#E8F8F5' : '#FFF',
                                                }}
                                            >
                                                <div style={styles.productHeader}>
                                                    <div>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleSelectProduct(product)}
                                                            style={styles.checkbox}
                                                            disabled={product.quantity === 0}
                                                        />
                                                        <label style={styles.productName}>
                                                            {product.ProductName}
                                                        </label>
                                                    </div>
                                                    <span
                                                        style={{
                                                            ...styles.badge,
                                                            backgroundColor: stockStatus.color,
                                                        }}
                                                    >
                                                        {product.quantity} in stock
                                                    </span>
                                                </div>
                                                <div style={styles.productDetails}>
                                                    <p style={styles.price}>
                                                        Price: <strong>₹{product.ProductPrice.toFixed(2)}</strong>
                                                    </p>
                                                    <p style={styles.barcode}>
                                                        Barcode: {product.ProductBarcode}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bill Summary */}
                    <div className="col-lg-6">
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>💰 Bill Summary</h3>

                            <div style={styles.billSection}>
                                <h4 style={styles.sectionTitle}>Selected Items ({selectedItems.length})</h4>
                                {selectedItems.length === 0 ? (
                                    <p style={styles.emptyMessage}>No items selected</p>
                                ) : (
                                    <div style={styles.selectedItems}>
                                        {selectedItems.map((item) => (
                                            <div key={item.productId} style={styles.billItem}>
                                                <div style={styles.itemInfo}>
                                                    <p style={styles.itemName}>{item.productName}</p>
                                                    <small style={styles.itemPrice}>
                                                        ₹{item.unitPrice.toFixed(2)} × {item.quantity}
                                                    </small>
                                                </div>
                                                <div style={styles.itemControls}>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.maxQuantity}
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            handleQuantityChange(
                                                                item.productId,
                                                                parseInt(e.target.value)
                                                            )
                                                        }
                                                        style={styles.quantityInput}
                                                    />
                                                    <button
                                                        onClick={() => handleRemoveItem(item.productId)}
                                                        style={styles.removeBtn}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div style={styles.itemSubtotal}>
                                                    ₹{(item.unitPrice * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Calculations */}
                            <div style={styles.billCalculations}>
                                <div style={styles.calcLine}>
                                    <span>Subtotal:</span>
                                    <strong>₹{subtotal.toFixed(2)}</strong>
                                </div>
                                <div style={styles.calcLine}>
                                    <label>
                                        Tax Rate (%):
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                            style={styles.taxInput}
                                        />
                                    </label>
                                    <strong>₹{taxAmount.toFixed(2)}</strong>
                                </div>
                                <div style={styles.totalLine}>
                                    <span>Total:</span>
                                    <strong>₹{total.toFixed(2)}</strong>
                                </div>
                            </div>

                            {/* Notes */}
                            <div style={styles.notesSection}>
                                <label style={styles.label}>Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add any additional notes here..."
                                    style={styles.textarea}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div style={styles.actionButtons}>
                                <button
                                    onClick={handleGenerateInvoice}
                                    disabled={selectedItems.length === 0 || loading}
                                    style={{
                                        ...styles.btn,
                                        ...styles.btnPrimary,
                                        opacity: selectedItems.length === 0 ? 0.6 : 1,
                                        cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {loading ? 'Generating...' : '📄 Generate Invoice'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <InvoicePreview
                    invoice={invoice}
                    onConfirm={handleConfirmInvoice}
                    onPrint={handlePrintInvoice}
                    onReset={handleResetBill}
                    loading={loading}
                />
            )}
        </div>
    );
};

/**
 * Invoice Preview Component
 * Displays printable invoice with confirmation & print options
 */
const InvoicePreview = ({ invoice, onConfirm, onPrint, onReset, loading }) => {
    return (
        <div style={styles.previewContainer}>
            {/* Printable Invoice */}
            <div style={styles.invoice}>
                <div style={styles.invoiceHeader}>
                    <div>
                        <h1 style={styles.invoiceTitle}>INVOICE</h1>
                        <p style={styles.invoiceNumber}>Invoice #: {invoice.invoiceNumber}</p>
                    </div>
                    <div>
                        <p><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            backgroundColor: invoice.status === 'draft' ? '#3498DB' : invoice.status === 'confirmed' ? '#27AE60' : '#95A5A6',
                            color: '#FFF',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>{invoice.status.toUpperCase()}</span></p>
                    </div>
                </div>

                {/* Items Table */}
                <table style={styles.invoiceTable}>
                    <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.tableCell}>Product</th>
                            <th style={styles.tableCell}>Quantity</th>
                            <th style={styles.tableCell}>Unit Price</th>
                            <th style={styles.tableCell}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, idx) => (
                            <tr key={idx} style={styles.tableRow}>
                                <td style={styles.tableCell}>{item.productName}</td>
                                <td style={styles.tableCell}>{item.quantity}</td>
                                <td style={styles.tableCell}>₹{item.unitPrice.toFixed(2)}</td>
                                <td style={styles.tableCell}>₹{item.subtotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div style={styles.invoiceTotals}>
                    <div style={styles.totalRow}>
                        <span>Subtotal:</span>
                        <strong>₹{invoice.subtotal.toFixed(2)}</strong>
                    </div>
                    {invoice.taxRate > 0 && (
                        <div style={styles.totalRow}>
                            <span>Tax ({invoice.taxRate}%):</span>
                            <strong>₹{invoice.taxAmount.toFixed(2)}</strong>
                        </div>
                    )}
                    <div style={styles.grandTotalRow}>
                        <span>Grand Total:</span>
                        <strong>₹{invoice.total.toFixed(2)}</strong>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div style={styles.invoiceNotes}>
                        <strong>Notes:</strong> {invoice.notes}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div style={styles.previewActions}>
                {invoice.status === 'draft' && (
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        style={{ ...styles.btn, ...styles.btnSuccess }}
                    >
                        {loading ? 'Confirming...' : '✓ Confirm Invoice & Deduct Stock'}
                    </button>
                )}
                <button
                    onClick={onPrint}
                    style={{ ...styles.btn, ...styles.btnInfo }}
                >
                    🖨️ Print Invoice
                </button>
                <button
                    onClick={onReset}
                    style={{ ...styles.btn, ...styles.btnSecondary }}
                >
                    ↻ Create New Bill
                </button>
            </div>
        </div>
    );
};

// Styling
const styles = {
    container: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '2rem',
    },
    header: {
        textAlign: 'center',
        color: '#FFF',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        marginBottom: '0.5rem',
    },
    subtitle: {
        fontSize: '1.1rem',
        opacity: 0.9,
    },
    alert: (type) => ({
        padding: '1rem',
        marginBottom: '1.5rem',
        borderRadius: '8px',
        backgroundColor: type === 'danger' ? '#FADBD8' : '#D5F4E6',
        color: type === 'danger' ? '#A83228' : '#186A3B',
        border: `1px solid ${type === 'danger' ? '#F5B7B1' : '#ABEBC6'}`,
        fontSize: '0.95rem',
    }),
    card: {
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem',
    },
    cardTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: '#1A202C',
        borderBottom: '3px solid #16A085',
        paddingBottom: '0.5rem',
    },
    spinner: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
    },
    productList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        maxHeight: '600px',
        overflowY: 'auto',
    },
    productItem: {
        padding: '1rem',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    },
    productHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
    },
    checkbox: {
        width: '20px',
        height: '20px',
        marginRight: '0.5rem',
        cursor: 'pointer',
    },
    productName: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#1A202C',
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '20px',
        color: '#FFF',
        fontSize: '0.85rem',
        fontWeight: 'bold',
    },
    productDetails: {
        marginLeft: '2rem',
    },
    price: {
        margin: '0.25rem 0',
        color: '#2D3748',
    },
    barcode: {
        margin: '0.25rem 0',
        color: '#718096',
        fontSize: '0.9rem',
    },
    billSection: {
        marginBottom: '1.5rem',
    },
    sectionTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#1A202C',
        marginBottom: '1rem',
    },
    emptyMessage: {
        textAlign: 'center',
        color: '#A0AEC0',
        padding: '1.5rem',
        fontStyle: 'italic',
    },
    selectedItems: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1rem',
    },
    billItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        backgroundColor: '#F7FAFC',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        margin: '0',
        fontWeight: '600',
        color: '#1A202C',
    },
    itemPrice: {
        color: '#718096',
    },
    itemControls: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
    },
    quantityInput: {
        width: '60px',
        padding: '0.5rem',
        border: '1px solid #CBD5E0',
        borderRadius: '6px',
        fontSize: '0.95rem',
        textAlign: 'center',
    },
    removeBtn: {
        width: '32px',
        height: '32px',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: '#FED7D7',
        color: '#C53030',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    itemSubtotal: {
        fontWeight: '700',
        color: '#16A085',
        minWidth: '80px',
        textAlign: 'right',
    },
    billCalculations: {
        padding: '1.5rem',
        backgroundColor: '#F7FAFC',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        borderLeft: '4px solid #16A085',
    },
    calcLine: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
        color: '#2D3748',
        fontSize: '0.95rem',
    },
    taxInput: {
        width: '70px',
        padding: '0.4rem',
        border: '1px solid #CBD5E0',
        borderRadius: '4px',
        marginLeft: '0.75rem',
        marginRight: '1rem',
    },
    totalLine: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: '2px solid #CBD5E0',
        fontSize: '1.1rem',
        color: '#1A202C',
    },
    notesSection: {
        marginBottom: '1.5rem',
    },
    label: {
        display: 'block',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#1A202C',
    },
    textarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #CBD5E0',
        borderRadius: '6px',
        fontFamily: 'inherit',
        fontSize: '0.95rem',
        minHeight: '80px',
        resize: 'vertical',
    },
    actionButtons: {
        display: 'flex',
        gap: '1rem',
    },
    btn: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    btnPrimary: {
        width: '100%',
        background: 'linear-gradient(135deg, #16A085 0%, #138D75 100%)',
        color: '#FFF',
    },
    btnSuccess: {
        background: 'linear-gradient(135deg, #27AE60 0%, #229954 100%)',
        color: '#FFF',
        flex: 1,
    },
    btnInfo: {
        background: 'linear-gradient(135deg, #3498DB 0%, #2980B9 100%)',
        color: '#FFF',
        flex: 1,
    },
    btnSecondary: {
        background: 'linear-gradient(135deg, #95A5A6 0%, #7F8C8D 100%)',
        color: '#FFF',
        flex: 1,
    },
    previewContainer: {
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginTop: '2rem',
    },
    invoice: {
        padding: '2rem',
        backgroundColor: '#FFFFFF',
        border: '2px solid #E2E8F0',
        borderRadius: '8px',
        marginBottom: '2rem',
    },
    invoiceHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '3px solid #16A085',
        paddingBottom: '1.5rem',
        marginBottom: '2rem',
    },
    invoiceTitle: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#1A202C',
        margin: '0 0 0.5rem 0',
    },
    invoiceNumber: {
        fontSize: '1rem',
        color: '#718096',
        margin: '0',
    },
    invoiceTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '2rem',
    },
    tableHeader: {
        backgroundColor: '#16A085',
        color: '#FFF',
    },
    tableCell: {
        padding: '1rem',
        textAlign: 'left',
        borderBottom: '1px solid #E2E8F0',
    },
    tableRow: {
        borderBottom: '1px solid #E2E8F0',
    },
    invoiceTotals: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.75rem',
        padding: '1.5rem',
        backgroundColor: '#F7FAFC',
        borderRadius: '8px',
        marginBottom: '1.5rem',
    },
    totalRow: {
        display: 'flex',
        gap: '2rem',
        fontSize: '1rem',
        color: '#2D3748',
    },
    grandTotalRow: {
        display: 'flex',
        gap: '2rem',
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#16A085',
        paddingTop: '1rem',
        borderTop: '2px solid #CBD5E0',
        width: '100%',
        justifyContent: 'space-between',
        paddingRight: '0',
    },
    invoiceNotes: {
        padding: '1rem',
        backgroundColor: '#FEF5E7',
        borderLeft: '4px solid #F39C12',
        borderRadius: '4px',
        fontSize: '0.95rem',
        color: '#7D6608',
    },
    previewActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
    },
};

export default InvoiceGenerator;
