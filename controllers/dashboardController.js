const db = require('../config/database');

exports.index = async (req, res) => {
    try {
        // Total Transaksi Hari Ini
        const [transaksiHariIni] = await db.query(
            'SELECT COUNT(*) as total FROM Transaksi WHERE DATE(tanggal) = CURDATE()'
        );

        // Total Penjualan Hari Ini
        const [penjualanHariIni] = await db.query(
            'SELECT COALESCE(SUM(total_harga), 0) as total FROM Transaksi WHERE DATE(tanggal) = CURDATE()'
        );

        // Total Stok Snack
        const [totalStok] = await db.query(
            'SELECT COALESCE(SUM(stok), 0) as total FROM Snack'
        );

        // Transaksi Terbaru
        const [transaksiTerbaru] = await db.query(`
            SELECT t.id_transaksi, t.tanggal, DATE_FORMAT(t.created_at, '%H:%i') as waktu, t.total_harga, u.nama_user
            FROM Transaksi t
            JOIN User u ON t.id_user = u.id_user
            ORDER BY t.created_at DESC
            LIMIT 5
        `);

        // Hitung total transaksi untuk nomor urut yang benar
        const [totalTransaksi] = await db.query(
            'SELECT COUNT(*) as total FROM Transaksi'
        );
        const totalCount = totalTransaksi[0].total;

        // Format harga (hapus desimal) dan tambah nomor urut (yang terbaru = nomor terbesar)
        transaksiTerbaru.forEach((t, index) => {
            t.total_harga = Math.floor(t.total_harga);
            t.no = totalCount - index; // Nomor urut terbalik: transaksi terbaru = nomor tertinggi
        });

        res.render('dashboard', {
            user: req.session.user,
            stats: {
                transaksiHariIni: transaksiHariIni[0].total,
                penjualanHariIni: Math.floor(penjualanHariIni[0].total),
                totalStok: totalStok[0].total
            },
            transaksiTerbaru
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan');
    }
};
