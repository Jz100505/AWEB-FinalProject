// ============================================================
//  ThriftHub — Cart Model
//  Collection: carts
//  Persists cart state in MongoDB so items survive page refresh
//  One cart document per user (upsert pattern)
// ============================================================

const mongoose = require('mongoose');

// ── Sub-schema: Each item inside the cart ─────────────────────
const cartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Product reference is required'],
        },

        // Snapshot display data so cart renders fast
        // without needing to populate/join every time
        name: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        size: {
            type: String,
            required: true,
        },

        image: {
            type: String,
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: [1, 'Quantity must be at least 1'],
        },
    },
    { _id: false }
);

// ── Main Cart Schema ───────────────────────────────────────────
const cartSchema = new mongoose.Schema(
    {
        // One cart per user — enforced by the unique index below
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
            unique: true,
        },

        items: {
            type: [cartItemSchema],
            default: [],
        },
    },
    {
        timestamps: true, // updatedAt tells you when cart was last changed
    }
);

// ── Indexes ───────────────────────────────────────────────────
cartSchema.index({ userId: 1 }, { unique: true }); // one cart per user

// ── Virtual: computed cart total ──────────────────────────────
// Use cart.total in your Angular service without storing it in DB
cartSchema.virtual('total').get(function () {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// ── Static Methods ────────────────────────────────────────────

// Get or create a cart for a user
cartSchema.statics.getOrCreate = async function (userId) {
    let cart = await this.findOne({ userId });
    if (!cart) {
        cart = await this.create({ userId, items: [] });
    }
    return cart;
};

// Add or update an item in the cart
cartSchema.statics.addItem = async function (userId, newItem) {
    const cart = await this.getOrCreate(userId);

    const existingIndex = cart.items.findIndex(
        (i) => i.productId.toString() === newItem.productId.toString()
    );

    if (existingIndex > -1) {
        // Item already in cart — increase quantity
        cart.items[existingIndex].quantity += newItem.quantity || 1;
    } else {
        // New item — push to array
        cart.items.push(newItem);
    }

    return cart.save();
};

// Remove a specific item from the cart
cartSchema.statics.removeItem = async function (userId, productId) {
    return this.findOneAndUpdate(
        { userId },
        { $pull: { items: { productId } } },
        { new: true }
    );
};

// Clear the entire cart (called after successful checkout)
cartSchema.statics.clearCart = async function (userId) {
    return this.findOneAndUpdate(
        { userId },
        { $set: { items: [] } },
        { new: true }
    );
};

module.exports = mongoose.models.Cart || mongoose.model('Cart', cartSchema);