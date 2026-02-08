const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Set timezone untuk Node.js ke WIB (UTC+7)
process.env.TZ = 'Asia/Jakarta';

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 jam
}));

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const kasirRoutes = require('./routes/kasir');
const stokRoutes = require('./routes/stok');
const laporanRoutes = require('./routes/laporan');

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/kasir', kasirRoutes);
app.use('/stok', stokRoutes);
app.use('/laporan', laporanRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
