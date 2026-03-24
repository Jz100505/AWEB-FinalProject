// netlify/functions/models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Prevent model recompilation in warm Lambda instances
module.exports =
    mongoose.models.User || mongoose.model('User', userSchema);