// Explicitly load .env so MONGODB_URI is available when running via
// `netlify dev`. The Netlify CLI does not automatically inject .env
// into function child processes the way `node -r dotenv/config` would.
// ROOT CAUSE FIX: test-atlas.js works because it calls require('dotenv').config()
// directly — the functions never did, so process.env.MONGODB_URI was undefined.
require('dotenv').config();

const mongoose = require('mongoose');

let cached = global._mongooseCache;
if (!cached) {
    cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        throw new Error(
            'MONGODB_URI is not defined. ' +
            'Ensure a .env file exists at the project root with MONGODB_URI=mongodb+srv://...'
        );
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                maxPoolSize: 1,
                bufferCommands: false,
            })
            .then((m) => m)
            .catch((err) => {
                // Clear the promise on failure so the next request retries
                cached.promise = null;
                throw err;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = connectDB;