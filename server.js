const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Load the database connection setup
require('./db');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Import router files
const userroutes = require('./routes/userroutes');
const candidateroutes = require('./routes/candidateroutes');

// Use the routers
app.use('/user', userroutes);
app.use('/candidate',candidateroutes);

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
});
