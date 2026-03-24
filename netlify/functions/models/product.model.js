const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: 0,
        },
        category: {
            type: String,
            trim: true,
            default: 'Uncategorized',
        },
        image: {
            type: String,
            default: '',
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);