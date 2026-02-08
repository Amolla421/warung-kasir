const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

router.get('/', isAuthenticated, laporanController.index);
router.post('/filter', isAuthenticated, laporanController.filter);
router.get('/detail/:id', isAuthenticated, laporanController.detail);
router.post('/delete', isAuthenticated, laporanController.deleteTransaksi);

module.exports = router;
