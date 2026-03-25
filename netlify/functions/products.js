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

        const normalized = products.map((p) => ({
            ...p,
            images: resolveImageUrl(p.image) ? [resolveImageUrl(p.image)] : [],
            size: p.size ?? [],
            condition: p.condition ?? 'Pre-loved',
        }));

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(normalized),
        };
    } catch (error) {
        // ROOT CAUSE FIX: surface the real error message so 500s are debuggable.
        // Previously the module-level throw in db.js made this catch unreachable.
        console.error('[products] handler error:', error);

        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Internal server error',
                // Only expose detail outside production so devs can see the real cause
                ...(process.env.NODE_ENV !== 'production' && {
                    detail: error.message,
                }),
            }),
        };
    }
};