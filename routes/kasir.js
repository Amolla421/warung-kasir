const express = require('express');
const router = express.Router();
const kasirController = require('../controllers/kasirController');

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

router.get('/', isAuthenticated, kasirController.index);
router.post('/add-item', isAuthenticated, kasirController.addItem);
router.post('/remove-item', isAuthenticated, kasirController.removeItem);
router.post('/checkout', isAuthenticated, kasirController.checkout);
router.post('/clear-cart', isAuthenticated, kasirController.clearCart);

module.exports = router;
