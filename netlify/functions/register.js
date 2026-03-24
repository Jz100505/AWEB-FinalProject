// netlify/functions/register.js
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
        const { name, email, password } = JSON.parse(event.body || '{}');

        if (!name || !email || !password) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ message: 'All fields are required.' })
            };
        }

        await connectDB();

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return {
                statusCode: 409, // Conflict
                headers,
                body: JSON.stringify({ message: 'An account with this email already exists.' })
            };
        }

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            passwordHash: hashPassword(password),
        });

        await newUser.save();

        return {
            statusCode: 201, // Created
            headers,
            body: JSON.stringify({
                message: 'Account created successfully!',
                user: { id: newUser._id, name: newUser.name, email: newUser.email }
            })
        };

    } catch (err) {
        console.error('Register error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Something went wrong. Please try again.' })
        };
    }
};