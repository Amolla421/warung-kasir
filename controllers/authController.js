const bcrypt = require('bcryptjs');
const db = require('../config/database');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const [users] = await db.query('SELECT * FROM User WHERE username = ?', [username]);
        
        if (users.length === 0) {
            return res.render('login', { error: 'Username tidak ditemukan' });
        }

        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.render('login', { error: 'Password salah' });
        }

        req.session.user = {
            id: user.id_user,
            username: user.username,
            nama: user.nama_user
        };

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Terjadi kesalahan sistem' });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, password, nama_user } = req.body;

        const [existing] = await db.query('SELECT * FROM User WHERE username = ?', [username]);
        
        if (existing.length > 0) {
            return res.render('register', { error: 'Username sudah digunakan' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO User (username, password, nama_user) VALUES (?, ?, ?)',
            [username, hashedPassword, nama_user]
        );

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Terjadi kesalahan sistem' });
    }
};

exports.lupaPassword = async (req, res) => {
    try {
        const { username, password_baru } = req.body;

        const [users] = await db.query('SELECT * FROM User WHERE username = ?', [username]);
        
        if (users.length === 0) {
            return res.render('lupa-password', { error: 'Username tidak ditemukan' });
        }

        const hashedPassword = await bcrypt.hash(password_baru, 10);

        await db.query('UPDATE User SET password = ? WHERE username = ?', [hashedPassword, username]);

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.render('lupa-password', { error: 'Terjadi kesalahan sistem' });
    }
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};
