const connectDB = require('./utils/db');
const Product = require('./models/product.model');

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }

    try {
        await connectDB();

        const params = event.queryStringParameters || {};
        const limit = parseInt(params.limit) || 20;
        const category = params.category || null;

        const query = category ? { category } : {};

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Normalize: product.model.js stores `image` as a single string,
        // but the Angular app expects `images` as an array. We map it here
        // so the frontend works without touching the DB schema.
        const normalized = products.map((p) => ({
            ...p,
            images: p.image ? [p.image] : [],
            // `size` and `condition` don't exist in the schema yet — provide
            // safe fallbacks so the UI never crashes.
            size: p.size ?? [],
            condition: p.condition ?? 'Pre-loved',
        }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(normalized),
        };
    } catch (error) {
        console.error('Products fetch error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};