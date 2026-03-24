const connectDB = require('./utils/db');
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
    }

    try {
        await connectDB();

        const { name, email, password } = JSON.parse(event.body);

        if (!name || !email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Name, email, and password are required' }),
            };
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return {
                statusCode: 409,
                body: JSON.stringify({ message: 'An account with this email already exists' }),
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Account created successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            }),
        };
    } catch (error) {
        console.error('Register error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};