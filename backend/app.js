/*********  Piiquante web app  *********/

// Import dependencies and routes
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// suppress mongoose warning in console and configure dotenv
mongoose.set('strictQuery', true);
dotenv.config();

// Connect to MongoDB database allowing url parsing and unified totpolgy
mongoose.connect(process.env.CONNECTION_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Echec de la Connexion à MongoDB !'));

// Create express app
const app = express();

// Parse every request as json
app.use(express.json());

// Prevent CORS errors by authorizing access to api from all origin, allow some headers and methods
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Save routes
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);

// Set static path to images
app.use('/images', express.static(path.join(__dirname, 'images')));

// Export app as Node module
module.exports = app;
