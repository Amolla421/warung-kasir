const db = require('../config/database');

exports.index = async (req, res) => {
    try {
        const [snacks] = await db.query('SELECT * FROM Snack WHERE stok > 0 ORDER BY nama_snack');
        
        // Format harga untuk Indonesia (tanpa desimal)
        snacks.forEach(snack => {
            snack.harga = Math.floor(snack.harga);
        });

        if (!req.session.cart) {
            req.session.cart = [];
        }

        res.render('kasir', {
            user: req.session.user,
            snacks,
            cart: req.session.cart
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan');
    }
};

exports.addItem = async (req, res) => {
    try {
        const { id_snack, jumlah } = req.body;
        
        const [snacks] = await db.query('SELECT * FROM Snack WHERE id_snack = ?', [id_snack]);
        
        if (snacks.length === 0) {
            return res.json({ success: false, message: 'Snack tidak ditemukan' });
        }

        const snack = snacks[0];

        if (!req.session.cart) {
            req.session.cart = [];
        }

        const existingItem = req.session.cart.find(item => item.id_snack == id_snack);
        
        if (existingItem) {
            const newJumlah = existingItem.jumlah + parseInt(jumlah);
            if (newJumlah > snack.stok) {
                return res.json({ success: false, message: 'Stok tidak mencukupi' });
            }
            existingItem.jumlah = newJumlah;
            existingItem.subtotal = existingItem.jumlah * snack.harga;
        } else {
            if (parseInt(jumlah) > snack.stok) {
                return res.json({ success: false, message: 'Stok tidak mencukupi' });
            }
            req.session.cart.push({
                id_snack: snack.id_snack,
                nama_snack: snack.nama_snack,
                harga: snack.harga,
                jumlah: parseInt(jumlah),
                subtotal: snack.harga * parseInt(jumlah)
            });
        }

        res.json({ success: true, cart: req.session.cart });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Terjadi kesalahan' });
    }
};

exports.removeItem = async (req, res) => {
    try {
        const { id_snack } = req.body;
        
        if (!req.session.cart) {
            req.session.cart = [];
        }

        req.session.cart = req.session.cart.filter(item => item.id_snack != id_snack);

        res.json({ success: true, cart: req.session.cart });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Terjadi kesalahan' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        req.session.cart = [];
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Terjadi kesalahan' });
    }
};

exports.checkout = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { metode_pembayaran, jumlah_bayar } = req.body;

        if (!req.session.cart || req.session.cart.length === 0) {
            return res.json({ success: false, message: 'Keranjang kosong' });
        }

        const totalHarga = req.session.cart.reduce((sum, item) => sum + item.subtotal, 0);
        const kembalian = parseFloat(jumlah_bayar) - totalHarga;

        if (kembalian < 0) {
            return res.json({ success: false, message: 'Jumlah bayar kurang' });
        }

        await connection.beginTransaction();

        // Set timezone untuk connection ini
        await connection.query("SET time_zone = '+07:00'");

        // Insert Transaksi dengan waktu WIB
        const [transaksiResult] = await connection.query(
            'INSERT INTO Transaksi (tanggal, total_harga, id_user, created_at) VALUES (CURDATE(), ?, ?, CONVERT_TZ(NOW(), @@session.time_zone, "+07:00"))',
            [totalHarga, req.session.user.id]
        );

        const idTransaksi = transaksiResult.insertId;

        // Insert Detail Transaksi & Update Stok
        for (const item of req.session.cart) {
            await connection.query(
                'INSERT INTO Detail_Transaksi (id_transaksi, id_snack, jumlah_snack, subtotal) VALUES (?, ?, ?, ?)',
                [idTransaksi, item.id_snack, item.jumlah, item.subtotal]
            );

            await connection.query(
                'UPDATE Snack SET stok = stok - ? WHERE id_snack = ?',
                [item.jumlah, item.id_snack]
            );
        }

        // Insert Pembayaran
        await connection.query(
            'INSERT INTO Pembayaran (id_transaksi, metode_pembayaran, jumlah_bayar, kembalian) VALUES (?, ?, ?, ?)',
            [idTransaksi, metode_pembayaran, jumlah_bayar, kembalian]
        );

        await connection.commit();

        req.session.cart = [];

        res.json({ 
            success: true, 
            message: 'Transaksi berhasil',
            idTransaksi,
            kembalian 
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.json({ success: false, message: 'Terjadi kesalahan' });
    } finally {
        connection.release();
    }
};
