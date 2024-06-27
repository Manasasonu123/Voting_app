//This file is required for connecting Mongodb database and Nodejs
//It represents Mongobd connection 
const mongoose = require('mongoose');
require('dotenv').config()

// Define MongoDB connection URL
const mongoURL = process.env.LOCAL_URL; // 'hotels' db automatically created
//const mongoURL= process.env.MONGODB_URL           //MongoDB Atlas connection

// Set up MongoDB connection
mongoose.connect(mongoURL, {
  useNewUrlParser: true, // You can keep this or remove as it has no effect anymore
  useUnifiedTopology: true, // You can keep this or remove as it has no effect anymore
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
  // ssl: true, // Ensure SSL is enabled if your connection string does not include it
}).then(() => {
  console.log('Connected to MongoDB server');
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1); // Exit process with failure
});

// Get default connection
const db = mongoose.connection;

//Used to handle events and interact with database
db.on('connected', () => {
  console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
  console.log('MongoDB connection error: ' + err);
});

db.on('disconnected', () => {
  console.log('MongoDB server disconnected');
});

// Export database connection
module.exports = db;
