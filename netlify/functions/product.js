const connectDB = require('./utils/db');
const Product = require('./models/product.model');

function resolveImageUrl(image) {
    if (!image || typeof image !== 'string' || image.trim() === '') return '';
    const trimmed = image.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
        return trimmed;
    }
    return '/assets/images/' + trimmed;
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' }),
        };
    }

    const { id } = event.queryStringParameters || {};

    if (!id) {
        return {
            statusCode: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Missing required query parameter: id' }),
        };
    }

    try {
        await connectDB();

        const p = await Product.findById(id).lean();

        if (!p) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: 'Product not found' }),
            };
        }

        const normalized = {
            ...p,
            images: resolveImageUrl(p.image) ? [resolveImageUrl(p.image)] : [],
            size: p.size ?? [],
            condition: p.condition ?? 'Pre-loved',
        };

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(normalized),
        };
    } catch (error) {
        console.error('[product] handler error:', error);

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Internal server error',
                ...(process.env.NODE_ENV !== 'production' && {
                    detail: error.message,
                }),
            }),
        };
    }
};
