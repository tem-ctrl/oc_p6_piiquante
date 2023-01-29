/******* Multer configuration middleware ********/

// Import dependency
const multer = require('multer');

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images')
  },
  filename: (req, file, callback) => {
    // divide original name into name and extension
    const origName = file.originalname.split('.');
    const name = origName[0].split(' ').join('_');
    const extension = origName[1];
    callback(null, name + '-' + Date.now() + '.' + extension);
  }
});

// Export middleware as Node module
module.exports = multer({ storage: storage }).single('image');
