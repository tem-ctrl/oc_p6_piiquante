/*****  Sauce routes  ********/

// Import dependencies
const express= require('express');
const auth = require('../middleware/auth');
const sauceCtrl = require('../controllers/sauce');
const multer = require('../middleware/multer-config');

// Create an express router
const router = express.Router();

// Save different sauce routes to router
router.post('/', auth, multer, sauceCtrl.createSauce); 
router.get('/', auth, sauceCtrl.getAllSauces);               
router.get('/:id', auth, sauceCtrl.getOneSauce); 
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.rateSauce);

// export router as module
module.exports = router;
