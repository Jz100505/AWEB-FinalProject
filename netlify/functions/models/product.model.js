// ============================================================
//  ThriftHub — Product Model
//  Collection: products
//  Stores all thrift clothing items in the catalog
// ============================================================

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [100, 'Product name cannot exceed 100 characters'],
        },

        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },

        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },

        images: {
            type: [String],
            required: [true, 'At least one image is required'],
            validate: {
                validator: (arr) => arr.length >= 1,
                message: 'At least one product image URL is required',
            },
        },

        size: {
            type: String,
            required: [true, 'Size is required'],
            enum: {
                values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
                message: '{VALUE} is not a valid size',
            },
        },

        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: {
                values: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories', 'Sets'],
                message: '{VALUE} is not a valid category',
            },
        },

        condition: {
            type: String,
            required: [true, 'Item condition is required'],
            enum: {
                values: ['Like New', 'Good', 'Fair'],
                message: '{VALUE} is not a valid condition',
            },
        },

        // stock: 0 means out of stock, 1 means available
        // ThriftHub sells unique one-of-a-kind thrift pieces,
        // so stock will almost always be 0 or 1
        stock: {
            type: Number,
            required: true,
            default: 1,
            min: [0, 'Stock cannot be negative'],
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        // Automatically adds createdAt and updatedAt fields
        timestamps: true,
    }
);

// ── Indexes ───────────────────────────────────────────────────
// Speeds up catalog filtering by availability and category
productSchema.index({ isAvailable: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

// ── Pre-save Hook ─────────────────────────────────────────────
// Automatically set isAvailable to false when stock hits 0
productSchema.pre('save', function (next) {
    if (this.stock === 0) {
        this.isAvailable = false;
    } else {
        this.isAvailable = true;
    }
    next();
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);