const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema(
    {
        ProductName: {
            type: String,
            required: true,
        },
        ProductPrice: {
            type: Number,
            required: true,
        },
        ProductBarcode: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        lowStockThreshold: {
            type: Number,
            required: true,
            default: 10,
            min: 0,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        }
    });

// Middleware to update the updatedAt timestamp before saving
ProductSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to get stock status
ProductSchema.methods.getStockStatus = function() {
    if (this.quantity === 0) {
        return 'OUT_OF_STOCK';
    } else if (this.quantity <= this.lowStockThreshold) {
        return 'LOW_STOCK';
    } else {
        return 'IN_STOCK';
    }
};

const Products = mongoose.model("Products", ProductSchema)
module.exports = Products;
