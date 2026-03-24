const connectDB = require('./utils/db');
const User = require('./models/user.model');
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
    }

    try {
        await connectDB();

        const { email, password } = JSON.parse(event.body);

        if (!email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Email and password are required' }),
            };
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Invalid email or password' }),
            };
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Invalid email or password' }),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Login successful',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
            }),
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};