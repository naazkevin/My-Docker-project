const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const app = express();
const version = process.env.VERSION || "unknown";

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// --- DATABASE CONFIGURATION ---
const mongoUrl = process.env.MONGO_URL || "mongodb://admin:password@mongodb:27017/user-acc?authSource=admin";
const databaseName = "user-account";

let dbClient;

// Connect once (IMPORTANT for real apps)
async function connectDB() {
    try {
        dbClient = new MongoClient(mongoUrl);
        await dbClient.connect();
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ DB Connection Failed:", err.message);
    }
}
connectDB();

// Port
const port = process.env.PORT || 3000;

// 1. Serve HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 2. Serve Image
app.get('/profile-picture', (req, res) => {
    let imgPath = path.join(__dirname, "profile-1.jpg");
    if (fs.existsSync(imgPath)) {
        res.sendFile(imgPath);
    } else {
        res.status(404).send("Image not found");
    }
});

// 3. Update Profile
app.post('/update-profile', async (req, res) => {
    const userObj = req.body;
    userObj.userid = 1;

    try {
        const db = dbClient.db(databaseName);

        await db.collection("user").updateOne(
            { userid: 1 },
            { $set: userObj },
            { upsert: true }
        );

        res.send(userObj);
    } catch (err) {
        console.error("❌ DB Update Error:", err.message);
        res.status(500).send("Database failure");
    }
});

// 4. Get Profile
app.get('/get-profile', async (req, res) => {
    try {
        const db = dbClient.db(databaseName);
        const result = await db.collection("user").findOne({ userid: 1 });

        res.send(result || {});
    } catch (err) {
        console.error("❌ DB Fetch Error:", err.message);
        res.status(500).send({});
    }
});

// ✅ REAL Health Check (THIS is the key fix)
app.get('/health', async (req, res) => {
    try {
        const db = dbClient.db(databaseName);
        await db.command({ ping: 1 });

        res.status(200).send("OK");
    } catch (err) {
        console.error("❌ Health check DB failed");
        res.status(500).send("NOT OK");
    }
});

// Version endpoint
app.get('/version', (req, res) => {
    res.send(`Running version: ${version}`);
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});