const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});

router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});

router.post('/login', authController.login);

router.get('/lupa-password', (req, res) => {
    res.render('lupa-password');
});

router.post('/lupa-password', authController.lupaPassword);

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', authController.register);

router.get('/logout', authController.logout);

module.exports = router;
