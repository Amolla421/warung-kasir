const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/products/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Hanya file gambar yang diperbolehkan!');
        }
    }
});

exports.upload = upload;

exports.index = async (req, res) => {
    try {
        const [snacks] = await db.query('SELECT * FROM Snack ORDER BY id_snack ASC');

        // Format harga untuk Indonesia (tanpa desimal)
        snacks.forEach(snack => {
            snack.harga = Math.floor(snack.harga);
        });

        res.render('stok', {
            user: req.session.user,
            snacks
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan');
    }
};

exports.addSnack = async (req, res) => {
    try {
        const { nama_snack, harga, stok } = req.body;
        const gambar = req.file ? '/images/products/' + req.file.filename : null;

        await db.query(
            'INSERT INTO Snack (nama_snack, harga, stok, gambar) VALUES (?, ?, ?, ?)',
            [nama_snack, harga, stok, gambar]
        );

        res.redirect('/stok');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan');
    }
};

exports.updateSnack = async (req, res) => {
    try {
        const { id_snack, nama_snack, harga, stok, gambar_lama } = req.body;
        let gambar = gambar_lama;

        // Jika ada gambar baru diupload
        if (req.file) {
            gambar = '/images/products/' + req.file.filename;
            
            // Hapus gambar lama jika ada
            if (gambar_lama && gambar_lama !== '') {
                const fs = require('fs');
                const path = require('path');
                const oldImagePath = path.join(__dirname, '..', 'public', gambar_lama);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        await db.query(
            'UPDATE Snack SET nama_snack = ?, harga = ?, stok = ?, gambar = ? WHERE id_snack = ?',
            [nama_snack, harga, stok, gambar, id_snack]
        );

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Terjadi kesalahan: ' + error.message });
    }
};

exports.deleteSnack = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id_snack } = req.body;

        // Cek apakah snack sudah pernah digunakan di transaksi
        const [transaksi] = await connection.query(
            'SELECT COUNT(*) as count FROM Detail_Transaksi WHERE id_snack = ?',
            [id_snack]
        );

        if (transaksi[0].count > 0) {
            await connection.rollback();
            return res.json({ 
                success: false, 
                message: 'Snack tidak dapat dihapus karena sudah ada dalam riwayat transaksi. Anda dapat mengubah stok menjadi 0 jika ingin menonaktifkan.' 
            });
        }

        // Hapus gambar jika ada
        const [snack] = await connection.query('SELECT gambar FROM Snack WHERE id_snack = ?', [id_snack]);
        if (snack.length > 0 && snack[0].gambar) {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(__dirname, '..', 'public', snack[0].gambar);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Hapus snack
        await connection.query('DELETE FROM Snack WHERE id_snack = ?', [id_snack]);

        // OTOMATIS REORDER ID - Ambil semua data yang tersisa
        const [snacks] = await connection.query('SELECT * FROM Snack ORDER BY id_snack');

        if (snacks.length > 0) {
            // Buat tabel temporary
            await connection.query('CREATE TEMPORARY TABLE Snack_Temp LIKE Snack');

            // Copy data ke temporary table dengan ID baru (urut dari 1)
            for (let i = 0; i < snacks.length; i++) {
                const s = snacks[i];
                await connection.query(
                    'INSERT INTO Snack_Temp (nama_snack, harga, stok, gambar, created_at) VALUES (?, ?, ?, ?, ?)',
                    [s.nama_snack, s.harga, s.stok, s.gambar, s.created_at]
                );
            }

            // Hapus semua data di tabel asli
            await connection.query('DELETE FROM Snack');

            // Reset auto increment
            await connection.query('ALTER TABLE Snack AUTO_INCREMENT = 1');

            // Copy kembali dari temporary ke tabel asli (ID otomatis urut 1, 2, 3, ...)
            await connection.query(`
                INSERT INTO Snack (nama_snack, harga, stok, gambar, created_at)
                SELECT nama_snack, harga, stok, gambar, created_at FROM Snack_Temp
            `);

            // Drop temporary table
            await connection.query('DROP TEMPORARY TABLE Snack_Temp');
        } else {
            // Jika tabel kosong, reset auto increment ke 1
            await connection.query('ALTER TABLE Snack AUTO_INCREMENT = 1');
        }

        await connection.commit();
        res.json({ success: true });
        
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.json({ success: false, message: 'Terjadi kesalahan: ' + error.message });
    } finally {
        connection.release();
    }
};

