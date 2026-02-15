import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const SalesAnalytics = () => {
    const { token } = useContext(AuthContext);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('all'); // all, today, week, month
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [token, timeRange, startDate, endDate]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError('');
        try {
            let params = new URLSearchParams();

            // Set date range based on selection
            if (timeRange === 'today') {
                const today = new Date().toISOString().split('T')[0];
                params.append('startDate', today);
                params.append('endDate', today);
            } else if (timeRange === 'week') {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                params.append('startDate', weekAgo.toISOString().split('T')[0]);
                params.append('endDate', today.toISOString().split('T')[0]);
            } else if (timeRange === 'month') {
                const today = new Date();
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                params.append('startDate', monthAgo.toISOString().split('T')[0]);
                params.append('endDate', today.toISOString().split('T')[0]);
            } else if (timeRange === 'custom') {
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
            }

            const response = await fetch(`https://inventra-smart-inventory-manager-backend-yrr0.onrender.com/sales/analytics/summary?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (data.success) {
                setAnalytics(data.analytics);
            } else {
                setError(data.message || 'Failed to fetch analytics');
                setAnalytics(null);
            }
        } catch (err) {
            setError('Failed to fetch analytics: ' + err.message);
            console.log(err);
            setAnalytics(null);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        if (range !== 'custom') {
            setStartDate('');
            setEndDate('');
        }
    };

    const StatCard = ({ icon, label, value, subtext, color, highlight }) => (
        <div style={{
            ...styles.statCard,
            borderTop: `4px solid ${color}`,
            backgroundColor: highlight ? `${color}08` : '#FFF',
        }}>
            <div style={styles.statIcon}>{icon}</div>
            <div style={styles.statContent}>
                <p style={styles.statLabel}>{label}</p>
                <p style={{
                    ...styles.statValue,
                    color: highlight ? color : '#1A202C',
                    fontSize: highlight ? '1.8rem' : '1.5rem',
                    fontWeight: highlight ? 'bold' : '600',
                }}>
                    {value}
                </p>
                {subtext && <p style={styles.statSubtext}>{subtext}</p>}
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>📈 Sales Analytics Dashboard</h1>
                <p style={styles.subtitle}>Real-time insights into your business performance</p>
            </div>

            {/* Error Alert */}
            {error && <div style={styles.alert('danger')}>{error}</div>}

            {/* Time Range Selector */}
            <div style={styles.timeRangeCard}>
                <div className="row g-2 align-items-end">
                    <div className="col-auto">
                        <label style={styles.label}>Select Period:</label>
                        <div style={styles.buttonGroup}>
                            {['all', 'today', 'week', 'month', 'custom'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => handleTimeRangeChange(range)}
                                    style={{
                                        ...styles.timeBtn,
                                        ...(timeRange === range ? styles.timeBtnActive : {}),
                                    }}
                                >
                                    {range === 'all' && '📅 All Time'}
                                    {range === 'today' && '📆 Today'}
                                    {range === 'week' && '📊 This Week'}
                                    {range === 'month' && '📈 This Month'}
                                    {range === 'custom' && '🔧 Custom'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Date Range */}
                    {timeRange === 'custom' && (
                        <>
                            <div className="col-md-3">
                                <label style={styles.label}>Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                            <div className="col-md-3">
                                <label style={styles.label}>End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={styles.input}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Analytics Cards */}
            {loading ? (
                <div style={styles.spinner}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading analytics...</span>
                    </div>
                </div>
            ) : analytics ? (
                <>
                    {/* Primary Metrics Row */}
                    <div className="row g-3" style={{ marginBottom: '2rem' }}>
                        <div className="col-md-6 col-lg-3">
                            <StatCard
                                icon="💰"
                                label="Total Revenue"
                                value={`₹${analytics.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                subtext={`From ${analytics.totalInvoices} invoices`}
                                color="#27AE60"
                                highlight={true}
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <StatCard
                                icon="📄"
                                label="Total Invoices"
                                value={analytics.totalInvoices}
                                subtext={`${analytics.totalItems} items sold`}
                                color="#3498DB"
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <StatCard
                                icon="🌅"
                                label="Today's Sales"
                                value={`₹${analytics.todaysRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                subtext="Latest sales data"
                                color="#E74C3C"
                            />
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <StatCard
                                icon="💳"
                                label="Avg Order Value"
                                value={`₹${analytics.averageOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                subtext="Per transaction"
                                color="#F39C12"
                            />
                        </div>
                    </div>

                    {/* Secondary Metrics Row */}
                    <div className="row g-3">
                        <div className="col-md-6 col-lg-4">
                            <StatCard
                                icon="⭐"
                                label="Highest Sale"
                                value={`₹${analytics.highestSale.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                subtext="Maximum order amount"
                                color="#9B59B6"
                            />
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <StatCard
                                icon="🧮"
                                label="Total Tax Collected"
                                value={`₹${analytics.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                subtext="All invoices"
                                color="#16A085"
                            />
                        </div>
                        {analytics.periodDays && (
                            <div className="col-md-6 col-lg-4">
                                <StatCard
                                    icon="📅"
                                    label="Daily Average"
                                    value={`₹${(analytics.totalRevenue / analytics.periodDays).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    subtext={`Over ${analytics.periodDays} days`}
                                    color="#1ABC9C"
                                />
                            </div>
                        )}
                    </div>

                    {/* Summary Stats */}
                    <div className="row" style={{ marginTop: '2rem' }}>
                        <div className="col-12">
                            <div style={styles.summaryCard}>
                                <h3 style={styles.summaryTitle}>📊 Summary</h3>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div style={styles.summaryItem}>
                                            <span style={styles.summaryLabel}>Total Items Sold:</span>
                                            <span style={styles.summaryValue}>{analytics.totalItems}</span>
                                        </div>
                                        <div style={styles.summaryItem}>
                                            <span style={styles.summaryLabel}>Average Items per Invoice:</span>
                                            <span style={styles.summaryValue}>
                                                {analytics.totalInvoices > 0 
                                                    ? (analytics.totalItems / analytics.totalInvoices).toFixed(2)
                                                    : 0
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div style={styles.summaryItem}>
                                            <span style={styles.summaryLabel}>Tax Rate Applied:</span>
                                            <span style={styles.summaryValue}>Varies</span>
                                        </div>
                                        <div style={styles.summaryItem}>
                                            <span style={styles.summaryLabel}>Net Revenue (After Tax):</span>
                                            <span style={{
                                                ...styles.summaryValue,
                                                color: '#27AE60',
                                                fontWeight: 'bold',
                                            }}>
                                                ₹{(analytics.totalRevenue - analytics.totalTax).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div style={styles.noData}>
                    <p>📭 No analytics data available for the selected period</p>
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
    timeRangeCard: {
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
    buttonGroup: {
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    timeBtn: {
        padding: '0.5rem 1rem',
        border: '2px solid #CBD5E0',
        backgroundColor: '#FFF',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        color: '#4A5568',
        fontSize: '0.9rem',
    },
    timeBtnActive: {
        backgroundColor: '#16A085',
        color: '#FFF',
        borderColor: '#16A085',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #CBD5E0',
        borderRadius: '8px',
        fontSize: '0.95rem',
    },
    spinner: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
    },
    statCard: {
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
    },
    statIcon: {
        fontSize: '2.5rem',
        minWidth: '50px',
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        margin: '0',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    statValue: {
        margin: '0.5rem 0',
        fontSize: '1.5rem',
        fontWeight: '700',
    },
    statSubtext: {
        margin: '0.5rem 0 0 0',
        fontSize: '0.85rem',
        color: '#A0AEC0',
    },
    summaryCard: {
        backgroundColor: '#FFF',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        borderLeft: '5px solid #16A085',
    },
    summaryTitle: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        color: '#1A202C',
        marginBottom: '1.5rem',
    },
    summaryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 0',
        borderBottom: '1px solid #E2E8F0',
    },
    summaryLabel: {
        fontWeight: '600',
        color: '#4A5568',
    },
    summaryValue: {
        fontSize: '1.1rem',
        fontWeight: '700',
        color: '#16A085',
    },
    noData: {
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: '#FFF',
        borderRadius: '12px',
        color: '#A0AEC0',
        fontSize: '1.1rem',
        marginTop: '2rem',
    },
};

export default SalesAnalytics;
