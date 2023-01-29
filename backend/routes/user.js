/******  User routes  ********/

// Import dependencies
const express = require('express');
const expressBrute = require('express-brute');
const userCtrl = require('../controllers/user');

// Protect login route from brute force attacks
var store = new expressBrute.MemoryStore();
var bruteforce = new expressBrute(store);

// Create an express router
const router = express.Router();

// Save user routes to router
router.post('/signup', userCtrl.signup);
router.post('/login', bruteforce.prevent, userCtrl.login);

// Export router as module
module.exports = router;
