/******* User data model *******/

// Import dependencies
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

// Creata data model with Schema method of mongoose
const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true}
});

// Bring up errors occured in database
userSchema.plugin(mongodbErrorHandler);

// Make sure each user is unique in database
userSchema.plugin(uniqueValidator);

// Export model as Node module
module.exports = mongoose.model('User', userSchema);
