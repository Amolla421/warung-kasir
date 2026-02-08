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
        laporan.forEach(l => {
            l.total_harga = Math.floor(l.total_harga);
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
        laporan.forEach(l => {
            l.total_harga = Math.floor(l.total_harga);
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
        
        detail.forEach(d => {
            d.harga = Math.floor(d.harga);
            d.subtotal = Math.floor(d.subtotal);
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

        // KEMBALIKAN STOK PRODUK
        // Ambil detail transaksi untuk kembalikan stok
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

        // OTOMATIS REORDER ID TRANSAKSI
        const [transaksis] = await connection.query('SELECT * FROM Transaksi ORDER BY id_transaksi');

        if (transaksis.length > 0) {
            // Disable foreign key checks sementara
            await connection.query('SET FOREIGN_KEY_CHECKS = 0');

            // Buat tabel backup untuk Pembayaran
            await connection.query(`
                CREATE TEMPORARY TABLE Pembayaran_Backup (
                    id_pembayaran INT,
                    id_transaksi INT,
                    metode_pembayaran VARCHAR(50),
                    jumlah_bayar DECIMAL(10,2),
                    kembalian DECIMAL(10,2),
                    created_at TIMESTAMP
                )
            `);
            
            await connection.query(`
                INSERT INTO Pembayaran_Backup
                SELECT * FROM Pembayaran
            `);

            // Buat tabel backup untuk Detail_Transaksi
            await connection.query(`
                CREATE TEMPORARY TABLE Detail_Transaksi_Backup (
                    id_detail INT,
                    id_transaksi INT,
                    id_snack INT,
                    jumlah_snack INT,
                    subtotal DECIMAL(10,2)
                )
            `);
            
            await connection.query(`
                INSERT INTO Detail_Transaksi_Backup
                SELECT * FROM Detail_Transaksi
            `);

            // Buat tabel backup untuk Transaksi dengan ID mapping
            await connection.query(`
                CREATE TEMPORARY TABLE Transaksi_Backup (
                    old_id INT,
                    id_user INT,
                    tanggal DATE,
                    total_harga DECIMAL(10,2),
                    created_at TIMESTAMP
                )
            `);

            // Copy data transaksi ke backup
            for (let i = 0; i < transaksis.length; i++) {
                const t = transaksis[i];
                await connection.query(
                    'INSERT INTO Transaksi_Backup (old_id, id_user, tanggal, total_harga, created_at) VALUES (?, ?, ?, ?, ?)',
                    [t.id_transaksi, t.id_user, t.tanggal, t.total_harga, t.created_at]
                );
            }

            // Hapus semua data (foreign key sudah disabled)
            await connection.query('DELETE FROM Pembayaran');
            await connection.query('DELETE FROM Detail_Transaksi');
            await connection.query('DELETE FROM Transaksi');

            // Reset auto increment
            await connection.query('ALTER TABLE Transaksi AUTO_INCREMENT = 1');

            // Insert kembali Transaksi (ID otomatis urut 1, 2, 3, ...)
            await connection.query(`
                INSERT INTO Transaksi (id_user, tanggal, total_harga, created_at)
                SELECT id_user, tanggal, total_harga, created_at 
                FROM Transaksi_Backup
                ORDER BY old_id
            `);

            // Buat mapping old_id ke new_id
            await connection.query(`
                CREATE TEMPORARY TABLE ID_Mapping (
                    old_id INT,
                    new_id INT AUTO_INCREMENT PRIMARY KEY
                )
            `);

            await connection.query(`
                INSERT INTO ID_Mapping (old_id)
                SELECT old_id FROM Transaksi_Backup ORDER BY old_id
            `);

            // Insert kembali Pembayaran dengan ID transaksi yang baru
            await connection.query(`
                INSERT INTO Pembayaran (id_transaksi, metode_pembayaran, jumlah_bayar, kembalian, created_at)
                SELECT m.new_id, p.metode_pembayaran, p.jumlah_bayar, p.kembalian, p.created_at
                FROM Pembayaran_Backup p
                JOIN ID_Mapping m ON p.id_transaksi = m.old_id
            `);

            // Insert kembali Detail_Transaksi dengan ID transaksi yang baru
            await connection.query(`
                INSERT INTO Detail_Transaksi (id_transaksi, id_snack, jumlah_snack, subtotal)
                SELECT m.new_id, d.id_snack, d.jumlah_snack, d.subtotal
                FROM Detail_Transaksi_Backup d
                JOIN ID_Mapping m ON d.id_transaksi = m.old_id
            `);

            // Drop temporary tables
            await connection.query('DROP TEMPORARY TABLE IF EXISTS Transaksi_Backup');
            await connection.query('DROP TEMPORARY TABLE IF EXISTS Pembayaran_Backup');
            await connection.query('DROP TEMPORARY TABLE IF EXISTS Detail_Transaksi_Backup');
            await connection.query('DROP TEMPORARY TABLE IF EXISTS ID_Mapping');

            // Enable kembali foreign key checks
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        } else {
            // Jika tabel kosong, reset auto increment ke 1
            await connection.query('ALTER TABLE Transaksi AUTO_INCREMENT = 1');
        }

        await connection.commit();
        res.json({ success: true, message: 'Transaksi berhasil dihapus' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.json({ success: false, message: 'Terjadi kesalahan: ' + error.message });
    } finally {
        connection.release();
    }
};
