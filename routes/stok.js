const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stokController');

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

router.get('/', isAuthenticated, stokController.index);
router.post('/add', isAuthenticated, stokController.upload.single('gambar'), stokController.addSnack);
router.post('/update', isAuthenticated, stokController.upload.single('gambar'), stokController.updateSnack);
router.post('/delete', isAuthenticated, stokController.deleteSnack);

module.exports = router;
