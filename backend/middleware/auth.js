/****** Authentication middleware **********/

// Import dependencies
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Configure dotenv
dotenv.config();

// Create and export authentication middleware as Node module
module.exports = (req, res, next) => {
  try {
    // Get token from request header, decode it with authentication secret key and extract userId
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    const userId = decodedToken.userId;

    // Add authentication 
    req.auth = {
      userId: userId
    }
    // Trow unthorized error if requester isn't the owner of the sauce
    if (req.body.userId && req.body.userId !== userId) {
      return res.status(403).json({ error });
    } else {
      next();
    }

  } catch (error) {
    res.status(403).json({ error });
  }
};
