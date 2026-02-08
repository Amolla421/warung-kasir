const db = require('../config/database');

exports.index = async (req, res) => {
    try {
        const bulan = new Date().getMonth() + 1;
        const tahun = new Date().getFullYear();

        const [laporan] = await db.query(`
            SELECT 
                t.id_transaksi,
                DATE_FORMAT(t.tanggal, '%d/%m/%Y') as tanggal,
                DATE_FORMAT(t.created_at, '%H:%i') as waktu,
                t.total_harga,
                u.nama_user,
                p.metode_pembayaran
            FROM Transaksi t
            JOIN User u ON t.id_user = u.id_user
            LEFT JOIN Pembayaran p ON t.id_transaksi = p.id_transaksi
            WHERE MONTH(t.tanggal) = ? AND YEAR(t.tanggal) = ?
            ORDER BY t.created_at DESC
        `, [bulan, tahun]);

        const [summary] = await db.query(`
            SELECT 
                COUNT(*) as total_transaksi,
                COALESCE(SUM(total_harga), 0) as total_penjualan
            FROM Transaksi
            WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?
        `, [bulan, tahun]);

        // Data untuk grafik bulanan (12 bulan terakhir)
        const [grafikData] = await db.query(`
            SELECT 
                MONTH(tanggal) as bulan,
                YEAR(tanggal) as tahun,
                COUNT(*) as total_transaksi,
                COALESCE(SUM(total_harga), 0) as total_penjualan
            FROM Transaksi
            WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY YEAR(tanggal), MONTH(tanggal)
            ORDER BY YEAR(tanggal), MONTH(tanggal)
        `);

        // Format data grafik
        const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Oct', 'Nov', 'Des'];
        const grafikLabels = [];
        const grafikPenjualan = [];
        const grafikTransaksi = [];

        grafikData.forEach(item => {
            grafikLabels.push(namaBulan[item.bulan - 1] + ' ' + item.tahun);
            grafikPenjualan.push(Math.floor(item.total_penjualan));
            grafikTransaksi.push(item.total_transaksi);
        });

        // Format harga (hapus desimal)
        // ✨ PERBAIKI NOMOR URUT DAN DISPLAY ID (transaksi terbaru = nomor tertinggi)
        const totalLaporan = laporan.length;
        laporan.forEach((l, index) => {
            l.total_harga = Math.floor(l.total_harga);
            l.no = totalLaporan - index; // Nomor urut terbalik: transaksi terbaru = nomor tertinggi
            l.display_id = `#${String(totalLaporan - index).padStart(6, '0')}`; // Format: #000003, #000002, #000001
        });

        res.render('laporan', {
            user: req.session.user,
            laporan,
            summary: {
                total_transaksi: summary[0].total_transaksi,
                total_penjualan: Math.floor(summary[0].total_penjualan)
            },
            bulan,
            tahun,
            grafikLabels: JSON.stringify(grafikLabels),
            grafikPenjualan: JSON.stringify(grafikPenjualan),
            grafikTransaksi: JSON.stringify(grafikTransaksi)
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan');
    }
};

exports.filter = async (req, res) => {
    try {
        const { bulan, tahun } = req.body;

        const [laporan] = await db.query(`
            SELECT 
                t.id_transaksi,
                DATE_FORMAT(t.tanggal, '%d/%m/%Y') as tanggal,
                DATE_FORMAT(t.created_at, '%H:%i') as waktu,
                t.total_harga,
                u.nama_user,
                p.metode_pembayaran
            FROM Transaksi t
            JOIN User u ON t.id_user = u.id_user
            LEFT JOIN Pembayaran p ON t.id_transaksi = p.id_transaksi
            WHERE MONTH(t.tanggal) = ? AND YEAR(t.tanggal) = ?
            ORDER BY t.created_at DESC
        `, [bulan, tahun]);

        const [summary] = await db.query(`
            SELECT 
                COUNT(*) as total_transaksi,
                COALESCE(SUM(total_harga), 0) as total_penjualan
            FROM Transaksi
            WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?
        `, [bulan, tahun]);

        // Data untuk grafik bulanan (12 bulan terakhir)
        const [grafikData] = await db.query(`
            SELECT 
                MONTH(tanggal) as bulan,
                YEAR(tanggal) as tahun,
                COUNT(*) as total_transaksi,
                COALESCE(SUM(total_harga), 0) as total_penjualan
            FROM Transaksi
            WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY YEAR(tanggal), MONTH(tanggal)
            ORDER BY YEAR(tanggal), MONTH(tanggal)
        `);

        // Format data grafik
        const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Oct', 'Nov', 'Des'];
        const grafikLabels = [];
        const grafikPenjualan = [];
        const grafikTransaksi = [];

        grafikData.forEach(item => {
            grafikLabels.push(namaBulan[item.bulan - 1] + ' ' + item.tahun);
            grafikPenjualan.push(Math.floor(item.total_penjualan));
            grafikTransaksi.push(item.total_transaksi);
        });

        // Format harga (hapus desimal)
        // ✨ PERBAIKI NOMOR URUT DAN DISPLAY ID (transaksi terbaru = nomor tertinggi)
        const totalLaporan = laporan.length;
        laporan.forEach((l, index) => {
            l.total_harga = Math.floor(l.total_harga);
            l.no = totalLaporan - index; // Nomor urut terbalik: transaksi terbaru = nomor tertinggi
            l.display_id = `#${String(totalLaporan - index).padStart(6, '0')}`; // Format: #000003, #000002, #000001
        });

        res.render('laporan', {
            user: req.session.user,
            laporan,
            summary: {
                total_transaksi: summary[0].total_transaksi,
                total_penjualan: Math.floor(summary[0].total_penjualan)
            },
            bulan: parseInt(bulan),
            tahun: parseInt(tahun),
            grafikLabels: JSON.stringify(grafikLabels),
            grafikPenjualan: JSON.stringify(grafikPenjualan),
            grafikTransaksi: JSON.stringify(grafikTransaksi)
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan');
    }
};

exports.detail = async (req, res) => {
    try {
        const { id } = req.params;

        const [transaksi] = await db.query(`
            SELECT 
                t.*,
                DATE_FORMAT(t.tanggal, '%d/%m/%Y') as tanggal_format,
                DATE_FORMAT(t.created_at, '%H:%i') as waktu,
                u.nama_user,
                p.metode_pembayaran,
                p.jumlah_bayar,
                p.kembalian
            FROM Transaksi t
            JOIN User u ON t.id_user = u.id_user
            LEFT JOIN Pembayaran p ON t.id_transaksi = p.id_transaksi
            WHERE t.id_transaksi = ?
        `, [id]);

        if (transaksi.length === 0) {
            return res.status(404).send('Transaksi tidak ditemukan');
        }

        // Hitung nomor urut transaksi ini di bulan yang sama
        const bulan = new Date(transaksi[0].tanggal).getMonth() + 1;
        const tahun = new Date(transaksi[0].tanggal).getFullYear();
        
        const [allTransaksi] = await db.query(`
            SELECT id_transaksi
            FROM Transaksi
            WHERE MONTH(tanggal) = ? AND YEAR(tanggal) = ?
            ORDER BY created_at DESC
        `, [bulan, tahun]);

        // Cari posisi transaksi ini dan balik urutannya
        const indexFromNewest = allTransaksi.findIndex(t => t.id_transaksi === parseInt(id));
        const displayNo = allTransaksi.length - indexFromNewest;
        transaksi[0].display_no = displayNo;

        const [detail] = await db.query(`
            SELECT 
                dt.*,
                s.nama_snack,
                s.harga
            FROM Detail_Transaksi dt
            JOIN Snack s ON dt.id_snack = s.id_snack
            WHERE dt.id_transaksi = ?
        `, [id]);

        // Format harga (hapus desimal)
        transaksi[0].total_harga = Math.floor(transaksi[0].total_harga);
        transaksi[0].jumlah_bayar = Math.floor(transaksi[0].jumlah_bayar);
        transaksi[0].kembalian = Math.floor(transaksi[0].kembalian);
        
        // ✨ TAMBAHKAN NOMOR URUT UNTUK DETAIL
        detail.forEach((d, index) => {
            d.harga = Math.floor(d.harga);
            d.subtotal = Math.floor(d.subtotal);
            d.no = index + 1; // Nomor urut display
        });

        res.render('detail-transaksi', {
            user: req.session.user,
            transaksi: transaksi[0],
            detail
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan');
    }
};

exports.deleteTransaksi = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { id_transaksi } = req.body;

        await connection.beginTransaction();

        // Simpan data transaksi yang akan dihapus
        const [toDelete] = await connection.query(
            'SELECT * FROM Transaksi WHERE id_transaksi = ?',
            [id_transaksi]
        );

        if (toDelete.length === 0) {
            await connection.rollback();
            return res.json({ success: false, message: 'Transaksi tidak ditemukan' });
        }

        // KEMBALIKAN STOK PRODUK DULU SEBELUM HAPUS
        const [detailTransaksi] = await connection.query(
            'SELECT id_snack, jumlah_snack FROM Detail_Transaksi WHERE id_transaksi = ?',
            [id_transaksi]
        );

        // Kembalikan stok untuk setiap produk
        for (const detail of detailTransaksi) {
            await connection.query(
                'UPDATE Snack SET stok = stok + ? WHERE id_snack = ?',
                [detail.jumlah_snack, detail.id_snack]
            );
        }

        // Hapus pembayaran
        await connection.query('DELETE FROM Pembayaran WHERE id_transaksi = ?', [id_transaksi]);

        // Hapus detail transaksi
        await connection.query('DELETE FROM Detail_Transaksi WHERE id_transaksi = ?', [id_transaksi]);

        // Hapus transaksi
        await connection.query('DELETE FROM Transaksi WHERE id_transaksi = ?', [id_transaksi]);

        await connection.commit();
        res.json({ success: true, message: 'Transaksi berhasil dihapus dan stok dikembalikan' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.json({ success: false, message: 'Terjadi kesalahan: ' + error.message });
    } finally {
        connection.release();
    }
};
