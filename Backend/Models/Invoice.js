const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    invoiceNumber: {
        type: String,
        unique: true,
        required: true,
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true,
            },
            productName: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            unitPrice: {
                type: Number,
                required: true,
                min: 0,
            },
            subtotal: {
                type: Number,
                required: true,
                min: 0,
            },
        },
    ],
    subtotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    taxRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['draft', 'confirmed', 'printed'],
        default: 'draft',
    },
    notes: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Middleware to update the updatedAt timestamp before saving
InvoiceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to generate unique invoice number
InvoiceSchema.statics.generateInvoiceNumber = async function () {
    const count = await this.countDocuments();
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    return `INV-${year}${month}-${String(count + 1).padStart(5, '0')}`;
};

module.exports = mongoose.model('Invoice', InvoiceSchema);
