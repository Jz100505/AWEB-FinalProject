// netlify/functions/utils/db.js
const mongoose = require('mongoose');

let cached = null;

async function connectDB() {
    if (cached && mongoose.connection.readyState === 1) {
        return cached;
    }
    cached = await mongoose.connect(process.env.MONGODB_URI);
    return cached;
}

module.exports = connectDB;