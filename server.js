const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes");
const path = require("path");

const PORT = process.env.PORT || 3001;
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serves up static assets
if(process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}

//Connects to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/trade-hero");

//Sessions
const sessions = require("client-sessions");

app.use(sessions({
    cookieName: "session",
    secret: process.env.cookieSecret,
    duration: 24*60*60*1000 //24hrs
}))

//Pulls in API routes

//Sends all other reqs to React App
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, ".client/build/index.html"));
})

app.listen(PORT, () => {
    console.log(`API Server Live on Port ${PORT}`);
})