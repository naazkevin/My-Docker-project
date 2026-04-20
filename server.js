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
// Render-la MONGO_URL variable kuduthuruppom, adhu illana local docker path edukkum
const mongoUrl = process.env.MONGO_URL || "mongodb://admin:password@mongodb:27017/user-acc?authSource=admin";
const databaseName = "user-account";

// Port-ah dynamic-ah mathinomna Render-ku innum vasadhiya irukkum
const port = process.env.PORT || 3000;

setTimeout(() => {
    throw new Error("Crash after deploy 💥");
}, 15000);

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

// 3. Update Profile (Handles Name, Email, Interests, Location, and Hobbies)
app.post('/update-profile', async (req, res) => {
    const userObj = req.body;
    userObj['userid'] = 1; // Always updating the same user for this demo
    let client;

    try {
        client = await MongoClient.connect(mongoUrl);
        const db = client.db(databaseName);
        
        // Inga namma req.body-la enna anuppunaalum adhu database-la update aagidum
        await db.collection("user").updateOne(
            { userid: 1 }, 
            { $set: userObj }, 
            { upsert: true }
        );
        
        console.log("✅ Profile updated in MongoDB Atlas!");
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

// 5. Health Check
app.get('/health', (req, res) => {
    res.status(200).send("OK");
});
// 6. Version Check (IMPORTANT for DevOps)
app.get('/version', (req, res) => {
    res.send(`Running version: ${version}`);
});

app.listen(port, () => {
    console.log(`🚀 Server spinning at port ${port}`);
});