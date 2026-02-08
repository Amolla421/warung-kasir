const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Middleware untuk cek login
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

router.get('/', isAuthenticated, dashboardController.index);

module.exports = router;
