// netlify/functions/login.js
const connectDB = require('./utils/db');
const User = require('./models/user.model');
const crypto = require('crypto');

const SALT = 'thrifthub_salt_6aweb_2026';

function hashPassword(password) {
    return crypto
        .createHash('sha256')
        .update(password + SALT)
        .digest('hex');
}

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method not allowed' }) };
    }

    try {
        const { email, password } = JSON.parse(event.body || '{}');

        if (!email || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'All fields are required.' })
            };
        }

        await connectDB();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user || user.passwordHash !== hashPassword(password)) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ message: 'Invalid email or password.' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Welcome back!',
                user: { id: user._id, name: user.name, email: user.email }
            })
        };

    } catch (err) {
        console.error('Login error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Something went wrong. Please try again.' })
        };
    }
};