const express = require('express');
const router = express.Router();
const products = require('../Models/Products');
const Invoice = require('../Models/Invoice');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

/**
 * PRODUCT ROUTES WITH AUTHENTICATION
 * All routes are protected with JWT authentication
 * Some routes require admin role
 */

//Inserting(Creating) Data:
//Protected: Only authenticated users can add products
router.post("/insertproduct", protect, async (req, res) => {
    const { ProductName, ProductPrice, ProductBarcode, quantity, lowStockThreshold } = req.body;

    try {
        // Validate required fields
        if (!ProductName || !ProductPrice || !ProductBarcode || quantity === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields: ProductName, ProductPrice, ProductBarcode, quantity' });
        }

        // Check if product with same barcode exists for this user
        const pre = await products.findOne({ ProductBarcode: ProductBarcode, userId: req.user._id })
        console.log(pre);

        if (pre) {
            return res.status(422).json({ success: false, message: "Product with this barcode already exists." })
        }
        else {
            const addProduct = new products({ 
                ProductName, 
                ProductPrice, 
                ProductBarcode, 
                quantity: parseInt(quantity) || 0,
                lowStockThreshold: parseInt(lowStockThreshold) || 10,
                userId: req.user._id 
            })

            await addProduct.save();
            res.status(201).json({ success: true, message: 'Product added successfully', product: addProduct })
            console.log(addProduct)
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: 'Error adding product', error: err.message })
    }
})

//Getting(Reading) Data:
//Protected: Show products for the logged-in user
router.get('/products', protect, async (req, res) => {

    try {
        const getProducts = await products.find({ userId: req.user._id })
        console.log(getProducts);
        res.status(200).json(getProducts);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching products' });
    }
})

//Getting(Reading) individual Data:
//Protected: Show product details only to the owner
router.get('/products/:id', protect, async (req, res) => {

    try {
        const getProduct = await products.findById(req.params.id);
        
        // Check if product belongs to the authenticated user
        if (!getProduct || getProduct.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this product' });
        }
        
        console.log(getProduct);
        res.status(200).json(getProduct);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching product' });
    }
})

//Editing(Updating) Data:
//Protected: Only the product owner can update products
router.put('/updateproduct/:id', protect, async (req, res) => {
    const { ProductName, ProductPrice, ProductBarcode, quantity, lowStockThreshold } = req.body;

    try {
        // Find product and verify ownership
        const product = await products.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
        }
        
        const updateData = { 
            ProductName, 
            ProductPrice, 
            ProductBarcode,
            ...(quantity !== undefined && { quantity: parseInt(quantity) }),
            ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold) })
        };

        const updateProducts = await products.findByIdAndUpdate(req.params.id, updateData, { new: true });
        console.log("Data Updated");
        res.status(201).json({ success: true, message: 'Product updated successfully', product: updateProducts });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error updating product', error: err.message });
    }
})

//Deleting Data:
//Protected: Only the product owner can delete products
router.delete('/deleteproduct/:id', protect, async (req, res) => {

    try {
        // Find product and verify ownership
        const product = await products.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
        }
        
        const deleteProduct = await products.findByIdAndDelete(req.params.id);
        console.log("Data Deleted");
        res.status(200).json({ success: true, message: 'Product deleted successfully', product: deleteProduct });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error deleting product', error: err.message });
    }
})


/**
 * INVOICE ROUTES WITH AUTHENTICATION
 * Protected routes for invoice generation and management
 */

// Create Invoice (Draft)
// Protected: Create a new invoice without deducting stock
router.post('/createinvoice', protect, async (req, res) => {
    const { items, taxRate, notes } = req.body;

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Invoice must contain at least one item' });
        }

        // Validate and fetch product details
        let subtotal = 0;
        const invoiceItems = [];

        for (const item of items) {
            const product = await products.findById(item.productId);
            
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${item.productId} not found` });
            }

            if (product.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: `Not authorized to use product ${product.ProductName}` });
            }

            if (product.quantity < item.quantity) {
                return res.status(422).json({ success: false, message: `Insufficient stock for ${product.ProductName}. Available: ${product.quantity}, Requested: ${item.quantity}` });
            }

            const itemSubtotal = parseFloat((product.ProductPrice * item.quantity).toFixed(2));
            subtotal = parseFloat((subtotal + itemSubtotal).toFixed(2));

            invoiceItems.push({
                productId: product._id,
                productName: product.ProductName,
                quantity: item.quantity,
                unitPrice: product.ProductPrice,
                subtotal: itemSubtotal,
            });
        }

        const taxRateValue = parseFloat(taxRate) || 0;
        const taxAmount = parseFloat((subtotal * (taxRateValue / 100)).toFixed(2));
        const total = parseFloat((subtotal + taxAmount).toFixed(2));

        const invoiceNumber = await Invoice.generateInvoiceNumber();

        const invoice = new Invoice({
            userId: req.user._id,
            invoiceNumber,
            items: invoiceItems,
            subtotal,
            taxRate: taxRateValue,
            taxAmount,
            total,
            notes: notes || '',
            status: 'draft',
        });

        await invoice.save();
        res.status(201).json({ success: true, message: 'Invoice created successfully', invoice });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error creating invoice', error: err.message });
    }
});

// Get All Invoices for User
// Protected: Fetch all invoices for the logged-in user
router.get('/invoices', protect, async (req, res) => {
    try {
        const invoices = await Invoice.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, invoices });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching invoices', error: err.message });
    }
});

// Get Single Invoice
// Protected: Fetch specific invoice details (ownership verified)
router.get('/invoices/:id', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        if (invoice.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
        }

        res.status(200).json({ success: true, invoice });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching invoice', error: err.message });
    }
});

// Confirm Invoice & Deduct Stock
// Protected: Confirm invoice and reduce product stock quantities
router.put('/confirminvoice/:id', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        if (invoice.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to confirm this invoice' });
        }

        if (invoice.status !== 'draft') {
            return res.status(422).json({ success: false, message: 'Invoice has already been confirmed' });
        }

        // Deduct stock for each item
        for (const item of invoice.items) {
            const product = await products.findById(item.productId);

            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${item.productId} not found` });
            }

            if (product.quantity < item.quantity) {
                return res.status(422).json({ success: false, message: `Insufficient stock for ${product.ProductName}` });
            }

            product.quantity -= item.quantity;
            await product.save();
        }

        // Mark invoice as confirmed
        invoice.status = 'confirmed';
        await invoice.save();

        res.status(200).json({ success: true, message: 'Invoice confirmed and stock updated', invoice });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error confirming invoice', error: err.message });
    }
});

// Mark Invoice as Printed
// Protected: Mark invoice as printed
router.put('/printinvoice/:id', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        if (invoice.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to print this invoice' });
        }

        invoice.status = 'printed';
        await invoice.save();

        res.status(200).json({ success: true, message: 'Invoice marked as printed', invoice });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error printing invoice', error: err.message });
    }
});

/**
 * SALES HISTORY & ANALYTICS ROUTES
 * Protected routes for retrieving and analyzing sales data from confirmed invoices
 */

// Get All Sales (Confirmed Invoices) for user
// Protected: Retrieve all confirmed invoices with filtering options
router.get('/sales', protect, async (req, res) => {
    try {
        const { startDate, endDate, sortBy } = req.query;
        
        // Build filter object
        let filter = { 
            userId: req.user._id,
            status: { $in: ['confirmed', 'printed'] } // Only confirmed/printed invoices count as sales
        };

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                // Add 1 day to include the entire end date
                const end = new Date(endDate);
                end.setDate(end.getDate() + 1);
                filter.createdAt.$lte = end;
            }
        }

        // Determine sort order
        let sortOption = { createdAt: -1 }; // Default: newest first
        if (sortBy === 'oldest') {
            sortOption = { createdAt: 1 };
        } else if (sortBy === 'highestAmount') {
            sortOption = { total: -1 };
        } else if (sortBy === 'lowestAmount') {
            sortOption = { total: 1 };
        }

        const sales = await Invoice.find(filter).sort(sortOption);
        
        res.status(200).json({ success: true, sales });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching sales', error: err.message });
    }
});

// Get Sales Summary/Analytics
// Protected: Calculate aggregate sales metrics
router.get('/sales/analytics/summary', protect, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Build filter for confirmed invoices
        let filter = { 
            userId: req.user._id,
            status: { $in: ['confirmed', 'printed'] }
        };

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setDate(end.getDate() + 1);
                filter.createdAt.$lte = end;
            }
        }

        // Get all sales records
        const sales = await Invoice.find(filter);

        // Calculate metrics
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalInvoices = sales.length;
        const totalItems = sales.reduce((sum, sale) => 
            sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        );
        const totalTax = sales.reduce((sum, sale) => sum + sale.taxAmount, 0);
        
        // Today's sales (if no date filter)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaysSales = sales.filter(sale => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= today && saleDate < tomorrow;
        });
        
        const todaysRevenue = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
        const averageOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
        const highestSale = sales.length > 0 ? Math.max(...sales.map(s => s.total)) : 0;

        res.status(200).json({ 
            success: true, 
            analytics: {
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                totalInvoices,
                totalItems,
                totalTax: parseFloat(totalTax.toFixed(2)),
                todaysRevenue: parseFloat(todaysRevenue.toFixed(2)),
                averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
                highestSale: parseFloat(highestSale.toFixed(2)),
                periodDays: startDate && endDate ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : null
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error fetching analytics', error: err.message });
    }
});

// Search Sales by Invoice Number
// Protected: Find invoice by invoice number
router.get('/sales/search/:invoiceNumber', protect, async (req, res) => {
    try {
        const invoice = await Invoice.findOne({
            userId: req.user._id,
            invoiceNumber: req.params.invoiceNumber,
            status: { $in: ['confirmed', 'printed'] }
        });

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        res.status(200).json({ success: true, invoice });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Error searching invoice', error: err.message });
    }
});

module.exports = router;