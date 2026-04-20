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

// Port
const port = process.env.PORT || 3000;

/*
🔥 HEALTH SIMULATION (IMPORTANT)
App will become unhealthy after 15 seconds
*/
let isHealthy = true;

setTimeout(() => {
    console.log("❌ Simulating unhealthy state...");
    isHealthy = false;
}, 30000);   // <-- change to 30 seconds

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
    userObj['userid'] = 1;
    let client;

    try {
        client = await MongoClient.connect(mongoUrl);
        const db = client.db(databaseName);

        await db.collection("user").updateOne(
            { userid: 1 }, 
            { $set: userObj }, 
            { upsert: true }
        );

        console.log("✅ Profile updated in MongoDB!");
        res.send(userObj);

    } catch (err) {
        console.error("❌ DB Update Error:", err.message);
        res.status(500).send("Database failure");
    } finally {
        if (client) client.close();
    }
});

// 4. Get Profile
app.get('/get-profile', async (req, res) => {
    let client;

    try {
        client = await MongoClient.connect(mongoUrl);
        const db = client.db(databaseName);

        const result = await db.collection("user").findOne({ userid: 1 });
        res.send(result || {});

    } catch (err) {
        console.error("❌ DB Fetch Error:", err.message);
        res.status(500).send({});
    } finally {
        if (client) client.close();
    }
});

// 5. Health Check (UPDATED)
app.get('/health', (req, res) => {
    if (isHealthy) {
        res.status(200).send("OK");
    } else {
        res.status(500).send("NOT OK");
    }
});

// 6. Version Check
app.get('/version', (req, res) => {
    res.send(`Running version: ${version}`);
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});