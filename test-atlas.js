// test-atlas.js
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB Atlas!");

        const db = client.db("thrifthub"); // use lowercase
        const users = db.collection("users");

        const dummyUser = {
            name: "Test User",
            email: "test@example.com",
            passwordHash: "dummyhashedpassword"
        };

        const result = await users.insertOne(dummyUser);
        console.log("Inserted dummy user with _id:", result.insertedId);

    } catch (err) {
        console.error("❌ MongoDB connection failed:", err.message);
    } finally {
        await client.close();
    }
}

run();