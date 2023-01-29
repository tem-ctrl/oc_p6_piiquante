/******* User controllers ********/

// Import dependencies
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js');
const emailValidator = require('email-validator');
const passwordValidator = require('password-validator');
const dotenv = require('dotenv');
const User = require('../models/user');

// configure dotenv
dotenv.config();

/* Create strong password pattern : 8-16 characters long,
 must contain at lower, uppercase, numbers and special characters */
const passwordPattern = new passwordValidator();

passwordPattern
  .is().min(8)
  .is().max(16)
  .has().digits()
  .has().not().spaces()
  .has().symbols()
  .has().uppercase()
  .has().lowercase();


// Middleware
exports.signup = (req, res, next) => {
  // Check email validity
  if (!emailValidator.validate(req.body.email)) {
    return res.status(500).json({ message: "Addresse email invalide !\nformat attendu: example@email.com" });

  } else if (!passwordPattern.validate(req.body.password)) {
    return res.status(500).json({ message: `Mot de passes invalide, il doit être: entre 8 et 16 caractères,
    inclure des majuscules, minuscules, chiffres et caractères spéciaux.` });
  }

  // If email is valid, encrypt it then hash password before creating a new user
  const encryptedEmail = cryptoJS.SHA256(req.body.email, process.env.EMAIL_SECRET_KEY).toString();
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: encryptedEmail,
        password: hash
      });

      // Save new user to database
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};


// Login
exports.login = (req, res, next) => {
  // Encrypt email address
  const encryptedEmail = cryptoJS.SHA256(req.body.email, process.env.EMAIL_SECRET_KEY).toString();
  User.findOne({ email: encryptedEmail })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: "Utilisateur introuvable !" })
      }
      
      // Compare provided password with the one in database
      bcrypt.compare(req.body.password, user.password)
        .then(fromSameString => {
          if (!fromSameString) {
            return res.status(401).json({ message: "Mot de passe incorrect !" })
          }
          
          // Return userId and authentiacation token if user exists in database
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              process.env.JWT_SECRET_TOKEN,
              { expiresIn: '24h' }
            )
          })
        })
        .catch(error => res.status(500).json({ error }))
    })
    .catch(error => res.status(500).json({ error }));
};
