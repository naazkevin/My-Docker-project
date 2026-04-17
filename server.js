const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const app = express();

// Middleware to handle data
app.use(express.json());
app.use(express.static(__dirname)); 

// --- DATABASE CONFIGURATION ---
const mongoUrlLocal = process.env.MONGO_URL || "mongodb://admin:password@mongodb:27017/user-acc?authSource=admin";
const databaseName = "user-account";

// 1. Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// 2. Serve the Image (Your specific logic)
app.get('/profile-picture', (req, res) => {
    let imgPath = path.join(__dirname, "profile-1.jpg");
    if (fs.existsSync(imgPath)) {
        res.sendFile(imgPath);
    } else {
        console.error("❌ Image not found at:", imgPath);
        res.status(404).send("Image not found");
    }
});

// 3. Save Data to MongoDB (Modern Async Version)
app.post('/update-profile', async (req, res) => {
    const userObj = req.body;
    userObj['userid'] = 1;
    let client;

    try {
        client = await MongoClient.connect(mongoUrlLocal);
        const db = client.db(databaseName);
        
        await db.collection("user").updateOne(
            { userid: 1 }, 
            { $set: userObj }, 
            { upsert: true }
        );
        
        console.log("✅ Database updated successfully!");
        res.send(userObj); 
    } catch (err) {
        console.error("❌ DB Error:", err.message);
        res.status(500).send("Database failure"); 
    } finally {
        if (client) client.close();
    }
});

// 4. Get Data from MongoDB
app.get('/get-profile', async (req, res) => {
    let client;
    try {
        client = await MongoClient.connect(mongoUrlLocal);
        const db = client.db(databaseName);
        const result = await db.collection("user").findOne({ userid: 1 });
        res.send(result || {});
    } catch (err) {
        console.error("❌ Fetch Error:", err.message);
        res.status(500).send({});
    } finally {
        if (client) client.close();
    }
});

app.listen(3000, () => {
    console.log("🚀 Server spinning at http://localhost:3000");
})