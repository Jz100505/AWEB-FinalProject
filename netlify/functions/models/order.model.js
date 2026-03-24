const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        name: String,
        price: Number,
        image: String,
        quantity: Number,
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [orderItemSchema],
        total: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'confirmed',
        },
        shippingAddress: {
            fullName: String,
            address: String,
            city: String,
            postalCode: String,
            phone: String,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);