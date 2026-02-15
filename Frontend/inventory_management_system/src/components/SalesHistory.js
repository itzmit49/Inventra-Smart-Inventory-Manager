import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const SalesHistory = () => {
    const { token } = useContext(AuthContext);
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    
    // Modal state
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchSales();
    }, [token]);

    useEffect(() => {
        applyFilters();
    }, [sales, startDate, endDate, searchQuery, sortBy]);

    const fetchSales = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:3001/sales', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                setSales(data.sales || []);
            } else {
                setError(data.message || 'Failed to fetch sales');
                setSales([]);
            }
        } catch (err) {
            setError('Failed to fetch sales: ' + err.message);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...sales];

        // Date range filter
        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            filtered = filtered.filter(sale => new Date(sale.createdAt) >= start);
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            filtered = filtered.filter(sale => new Date(sale.createdAt) <= end);
        }

        // Search by invoice number
        if (searchQuery) {
            filtered = filtered.filter(sale =>
                sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort
        if (sortBy === 'newest') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'oldest') {
            filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortBy === 'highestAmount') {
            filtered.sort((a, b) => b.total - a.total);
        } else if (sortBy === 'lowestAmount') {
            filtered.sort((a, b) => a.total - b.total);
        }

        setFilteredSales(filtered);
    };

    const handleResetFilters = () => {
        setStartDate('');
        setEndDate('');
        setSearchQuery('');
        setSortBy('newest');
    };

    const handleViewDetails = (invoice) => {
        setSelectedInvoice(invoice);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedInvoice(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'confirmed':
                return '#27AE60';
            case 'printed':
                return '#3498DB';
            default:
                return '#95A5A6';
        }
    };

    return (
        <div style={styles.container}>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    .invoice-modal-content { 
                        margin: 0; 
                        box-shadow: none; 
                        border: none;
                    }
                }
            `}</style>

            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>📊 Sales History</h1>
                <p style={styles.subtitle}>Track and analyze all completed invoices</p>
            </div>

            {/* Error Alert */}
            {error && <div style={styles.alert('danger')}>{error}</div>}

            {/* Filters Section */}
            <div style={styles.filtersCard} className="no-print">
                <div className="row g-3">
                    {/* Date Range */}
                    <div className="col-md-6 col-lg-3">
                        <label style={styles.label}>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div className="col-md-6 col-lg-3">
                        <label style={styles.label}>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    {/* Search */}
                    <div className="col-md-6 col-lg-3">
                        <label style={styles.label}>Search Invoice #</label>
                        <input
                            type="text"
                            placeholder="e.g., INV-202602-00001"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    {/* Sort */}
                    <div className="col-md-6 col-lg-3">
                        <label style={styles.label}>Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={styles.input}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="highestAmount">Highest Amount</option>
                            <option value="lowestAmount">Lowest Amount</option>
                        </select>
                    </div>
                </div>

                {/* Reset Button */}
                {(startDate || endDate || searchQuery || sortBy !== 'newest') && (
                    <button
                        onClick={handleResetFilters}
                        style={styles.resetBtn}
                    >
                        🔄 Reset Filters
                    </button>
                )}
            </div>

            {/* Sales Table */}
            <div style={styles.tableCard}>
                {loading ? (
                    <div style={styles.spinner}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading sales...</span>
                        </div>
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p style={styles.emptyText}>
                            {sales.length === 0
                                ? '📭 No sales history yet. Create your first invoice!'
                                : '🔍 No sales match your filters'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={styles.tableInfo}>
                            <span style={styles.infoText}>
                                Showing <strong>{filteredSales.length}</strong> of <strong>{sales.length}</strong> sales
                            </span>
                        </div>

                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th style={styles.tableHeaderCell}>Invoice #</th>
                                    <th style={styles.tableHeaderCell}>Date</th>
                                    <th style={styles.tableHeaderCell}>Items</th>
                                    <th style={styles.tableHeaderCell}>Subtotal</th>
                                    <th style={styles.tableHeaderCell}>Tax</th>
                                    <th style={styles.tableHeaderCell}>Total</th>
                                    <th style={styles.tableHeaderCell}>Status</th>
                                    <th style={styles.tableHeaderCell}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.map((sale) => (
                                    <tr
                                        key={sale._id}
                                        style={{
                                            ...styles.tableRow,
                                            backgroundColor: sale.total > 5000 ? '#FEF5E7' : 'inherit',
                                        }}
                                    >
                                        <td style={styles.tableCell}>
                                            <span style={styles.invoiceNumber}>{sale.invoiceNumber}</span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <div style={styles.dateColumn}>
                                                <div style={styles.dateLarge}>{formatDate(sale.createdAt)}</div>
                                                <div style={styles.dateSmall}>{formatTime(sale.createdAt)}</div>
                                            </div>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={styles.itemCount}>{sale.items.length}</span>
                                        </td>
                                        <td style={styles.tableCell}>₹{sale.subtotal.toFixed(2)}</td>
                                        <td style={styles.tableCell}>₹{sale.taxAmount.toFixed(2)}</td>
                                        <td style={{
                                            ...styles.tableCell,
                                            fontWeight: 'bold',
                                            color: '#16A085',
                                            fontSize: '1.05rem',
                                        }}>
                                            ₹{sale.total.toFixed(2)}
                                        </td>
                                        <td style={styles.tableCell}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: getStatusBadgeColor(sale.status),
                                            }}>
                                                {sale.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={styles.tableCell}>
                                            <button
                                                onClick={() => handleViewDetails(sale)}
                                                style={styles.detailsBtn}
                                            >
                                                👁️ Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

            {/* Invoice Details Modal */}
            {showModal && selectedInvoice && (
                <div style={styles.modalOverlay} onClick={handleCloseModal}>
                    <div
                        style={styles.modalContent}
                        className="invoice-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={handleCloseModal}
                            style={styles.closeBtn}
                            className="no-print"
                        >
                            ✕
                        </button>

                        <div style={styles.invoiceDetail}>
                            <div style={styles.invoiceHeader}>
                                <h2 style={styles.invoiceTitle}>Invoice Details</h2>
                                <p style={styles.invoiceNumber}>{selectedInvoice.invoiceNumber}</p>
                            </div>

                            <div style={styles.invoiceInfo}>
                                <div style={styles.infoPair}>
                                    <span style={styles.infoLabel}>Date:</span>
                                    <span style={styles.infoValue}>{formatDate(selectedInvoice.createdAt)} at {formatTime(selectedInvoice.createdAt)}</span>
                                </div>
                                <div style={styles.infoPair}>
                                    <span style={styles.infoLabel}>Status:</span>
                                    <span style={{
                                        ...styles.infoValue,
                                        ...styles.statusBadge,
                                        backgroundColor: getStatusBadgeColor(selectedInvoice.status),
                                    }}>
                                        {selectedInvoice.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <table style={styles.itemsTable}>
                                <thead>
                                    <tr style={styles.itemsTableHeader}>
                                        <th style={styles.itemsTableCell}>Product</th>
                                        <th style={styles.itemsTableCell}>Qty</th>
                                        <th style={styles.itemsTableCell}>Unit Price</th>
                                        <th style={styles.itemsTableCell}>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.items.map((item, idx) => (
                                        <tr key={idx} style={styles.itemsTableRow}>
                                            <td style={styles.itemsTableCell}>{item.productName}</td>
                                            <td style={styles.itemsTableCell}>{item.quantity}</td>
                                            <td style={styles.itemsTableCell}>₹{item.unitPrice.toFixed(2)}</td>
                                            <td style={styles.itemsTableCell}>₹{item.subtotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div style={styles.totalsSummary}>
                                <div style={styles.totalLine}>
                                    <span>Subtotal:</span>
                                    <strong>₹{selectedInvoice.subtotal.toFixed(2)}</strong>
                                </div>
                                {selectedInvoice.taxRate > 0 && (
                                    <div style={styles.totalLine}>
                                        <span>Tax ({selectedInvoice.taxRate}%):</span>
                                        <strong>₹{selectedInvoice.taxAmount.toFixed(2)}</strong>
                                    </div>
                                )}
                                <div style={styles.grandTotal}>
                                    <span>Grand Total:</span>
                                    <strong>₹{selectedInvoice.total.toFixed(2)}</strong>
                                </div>
                            </div>

                            {selectedInvoice.notes && (
                                <div style={styles.notesSection}>
                                    <strong>Notes:</strong>
                                    <p>{selectedInvoice.notes}</p>
                                </div>
                            )}

                            <div style={styles.modalActions} className="no-print">
                                <button
                                    onClick={() => {
                                        window.print();
                                    }}
                                    style={{ ...styles.btn, ...styles.btnPrimary }}
                                >
                                    🖨️ Print
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    style={{ ...styles.btn, ...styles.btnSecondary }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
    }),
    filtersCard: {
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    },
    label: {
        display: 'block',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#1A202C',
        fontSize: '0.9rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #CBD5E0',
        borderRadius: '8px',
        fontSize: '0.95rem',
        transition: 'border-color 0.2s',
    },
    resetBtn: {
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#E2E8F0',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        color: '#4A5568',
        transition: 'all 0.2s',
    },
    tableCard: {
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
    spinner: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '2rem',
        color: '#A0AEC0',
    },
    emptyText: {
        fontSize: '1.2rem',
        fontStyle: 'italic',
    },
    tableInfo: {
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid #E2E8F0',
    },
    infoText: {
        color: '#718096',
        fontSize: '0.95rem',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#16A085',
        color: '#FFF',
    },
    tableHeaderCell: {
        padding: '1rem',
        textAlign: 'left',
        fontWeight: '600',
        fontSize: '0.9rem',
    },
    tableRow: {
        borderBottom: '1px solid #E2E8F0',
        transition: 'background-color 0.2s',
    },
    tableCell: {
        padding: '1rem',
        color: '#2D3748',
    },
    invoiceNumber: {
        fontFamily: 'monospace',
        fontWeight: '600',
        color: '#16A085',
    },
    dateColumn: {
        display: 'flex',
        flexDirection: 'column',
    },
    dateLarge: {
        fontWeight: '600',
        color: '#1A202C',
    },
    dateSmall: {
        fontSize: '0.85rem',
        color: '#718096',
    },
    itemCount: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        backgroundColor: '#E6FFFA',
        color: '#0D5A4D',
        borderRadius: '20px',
        fontWeight: '600',
        fontSize: '0.9rem',
    },
    statusBadge: {
        display: 'inline-block',
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        color: '#FFF',
        fontWeight: '600',
        fontSize: '0.75rem',
    },
    detailsBtn: {
        padding: '0.5rem 1rem',
        backgroundColor: '#3498DB',
        color: '#FFF',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
    },
    closeBtn: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#718096',
    },
    invoiceDetail: {
        paddingRight: '2rem',
    },
    invoiceHeader: {
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #E2E8F0',
    },
    invoiceTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#1A202C',
        margin: '0 0 0.5rem 0',
    },
    invoiceInfo: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        backgroundColor: '#F7FAFC',
        borderRadius: '8px',
    },
    infoPair: {
        display: 'flex',
        flexDirection: 'column',
    },
    infoLabel: {
        fontWeight: '600',
        color: '#4A5568',
        fontSize: '0.85rem',
        marginBottom: '0.25rem',
    },
    infoValue: {
        color: '#1A202C',
        fontSize: '0.95rem',
    },
    itemsTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '1.5rem',
    },
    itemsTableHeader: {
        backgroundColor: '#EDF2F7',
    },
    itemsTableCell: {
        padding: '0.75rem',
        borderBottom: '1px solid #E2E8F0',
        color: '#2D3748',
        fontSize: '0.9rem',
    },
    itemsTableRow: {
        borderBottom: '1px solid #E2E8F0',
    },
    totalsSummary: {
        padding: '1rem',
        backgroundColor: '#F7FAFC',
        borderRadius: '8px',
        marginBottom: '1rem',
    },
    totalLine: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        color: '#2D3748',
    },
    grandTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '0.75rem',
        borderTop: '2px solid #CBD5E0',
        fontSize: '1.1rem',
        color: '#16A085',
        fontWeight: 'bold',
    },
    notesSection: {
        padding: '1rem',
        backgroundColor: '#FEF5E7',
        borderLeft: '4px solid #F39C12',
        borderRadius: '4px',
        marginBottom: '1rem',
        fontSize: '0.95rem',
        color: '#7D6608',
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
    },
    btn: {
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    btnPrimary: {
        background: 'linear-gradient(135deg, #16A085 0%, #138D75 100%)',
        color: '#FFF',
    },
    btnSecondary: {
        backgroundColor: '#E2E8F0',
        color: '#4A5568',
    },
};

export default SalesHistory;
