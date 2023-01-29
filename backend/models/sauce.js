/******* Sauce data model *******/

// Import dependencies
const mongoose = require('mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

// Create a data model with Schema method of mongoose
const sauceSchema = mongoose.Schema({
  userId: {type: String, required: true},
  name: {type: String, required: true},
  manufacturer: {type: String, required: true},
  description: {type: String, required: true},
  mainPepper: {type: String, required: true},
  imageUrl: {type: String, required: true},
  heat: {type: Number, required: true},
  likes: {type: Number, defaut: 0},
  dislikes: {type: Number, defaut: 0},
  usersLiked: {type: [String]},
  usersDisliked: {type: [String]} 
})

// Bring up errors occured in database
sauceSchema.plugin(mongodbErrorHandler);

// Export model as Node module
module.exports = mongoose.model('Sauce', sauceSchema);
