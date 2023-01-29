/***************** Sauce controllers *********************/

// Import dependencies and model
const fs = require('fs');
const Sauce = require('../models/Sauce');


// Create new sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;

  // Create new instance of Sauce model
  const sauce = new Sauce({
    ...sauceObject,
    likes: 0,
    dislikes: 0,
    usersDisliked: [],
    usersLiked: [],
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })

  // Save that instance to database
  sauce.save()
    .then(() => res.status(201).json({ message: "Sauce créé !" }))
    .catch((error) => res.status(400).json({ error }));
};


// Get all sauces from database
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(404).json({ error }))
};


// Get one specific sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};


// Modify one sauce
exports.modifySauce = (req, res, next) => {

  // Use ternary operator to parse request body accordingly
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };fs
    

  // Find sauce by id
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      // If sauce not in database
      if (!sauce) {
        return res.status(404).json({ error: 'Sauce intouvable !' });
      }
      // Check if user has authorization to modify sauce
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({ error: 'Requête non autorisée !' })
      }

      // Delete old sauce image if new request contain image
      if (sauceObject.hasOwnProperty('imageUrl')) {
        const oldFilename = sauce.imageUrl.split('/images')[1];
        fs.unlink(`images/${oldFilename}`, (error) => {
          if (error) {
            return res.status(404).json({ error });
          }
        });
      }

      // Finally modify sauce
      Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: "Sauce modifiée" }))
        .catch((error) => res.status(400).json({ error }));
    });
};


// Delete sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (!sauce) {
        return res.status(404).json({ error: 'Sauce intouvable !' });
      }
      // Check user's authorization
      if (sauce.userId !== req.auth.userId) {
        return res.status(403).json({ error: 'Requête non autorisée !' })
      }

      // Delete sauce image from server and remove sauce entry from database
      const filename = sauce.imageUrl.split('/images')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }))
      })
    })
    .catch(() => res.status(500).json({ error: "Sauce introuvable !" }));
};


// Like or dislike sauce
exports.rateSauce = (req, res, next) => {

  let reqId = req.params.id;

  // Get sauce data from database
  Sauce.findOne({ _id: reqId })
    .then((sauce) => {

      let reqUserId = req.body.userId;
      let reqLike = req.body.like;
      let usersLiked = sauce.usersLiked;
      let usersDisliked = sauce.usersDisliked;

      // If user likes sauce
      if (reqLike === 1 && !usersLiked.includes(reqUserId)) {

        // Increment sauce's likes and append userId to sauce's usersLiked array
        Sauce.updateOne({ _id: reqId }, { $push: { usersLiked: reqUserId }, $inc: { likes: 1 } })
          .then(() => res.status(200).json({ message: "sauce likée !" }))
          .catch((error) => res.status(400).json({ error }));

        // If user neither like nor dislike sauce
      } else if (reqLike === 0) {

        // Decrement sauce's dislikes and remove userId from sauce's usersDisliked if user disliked before but not anymore
        if (usersDisliked.includes(reqUserId)) {
          Sauce.updateOne({ _id: reqId }, { $pull: { usersDisliked: reqUserId }, $inc: { dislikes: -1 } })
            .then(() => res.status(200).json({ message: "choix neutre !" }))
            .catch((error) => res.status(400).json({ error }));
        }

        // Decrement sauce's likes and remove userId from sauce's usersLiked if user liked before but not anymore
        if (usersLiked.includes(reqUserId)) {
          Sauce.updateOne({ _id: reqId }, { $pull: { usersLiked: reqUserId }, $inc: { likes: -1 } })
            .then(() => res.status(200).json({ message: "choix neutre !" }))
            .catch((error) => res.status(400).json({ error }));
        }

        // Increment sauce's dislikes and append userId to sauce's usersDisliked array if user disliked sauce
      } else if (reqLike === -1 && !usersDisliked.includes(reqUserId)) {
        Sauce.updateOne({ _id: reqId }, { $push: { usersDisliked: reqUserId }, $inc: { dislikes: 1 } })
          .then(() => res.status(200).json({ message: "sauce dislikée !" }))
          .catch((error) => res.status(400).json({ error }));

        //  Trow an error message if none of the above works
      } else {
        return res.status(401).json({ message: "l'opération n'a pas pu être effectuée" })
      }
    })
    .catch(error => res.status(404).json({ error }));
};
