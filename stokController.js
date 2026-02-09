const db = require('../config/database');
const { cloudinary, upload } = require('../config/cloudinary');

exports.upload = upload;

exports.index = async (req, res) => {
    try {
        const [snacks] = await db.query('SELECT * FROM Snack ORDER BY id_snack ASC');

        // Format harga untuk Indonesia (tanpa desimal)
        // ✨ TAMBAHKAN NOMOR URUT
        snacks.forEach((snack, index) => {
            snack.harga = Math.floor(snack.harga);
            snack.no = index + 1; // Nomor urut display
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
        
        // Log untuk debugging
        console.log('📝 Adding new snack:', { nama_snack, harga, stok });
        console.log('📷 File uploaded:', req.file ? 'Yes' : 'No');
        
        // Cloudinary mengembalikan URL lengkap di req.file.path
        const gambar = req.file ? req.file.path : null;
        
        if (req.file) {
            console.log('✅ Image URL from Cloudinary:', gambar);
        }

        await db.query(
            'INSERT INTO Snack (nama_snack, harga, stok, gambar) VALUES (?, ?, ?, ?)',
            [nama_snack, harga, stok, gambar]
        );

        console.log('✅ Snack added successfully!');
        res.redirect('/stok');
    } catch (error) {
        console.error('❌ Error adding snack:', error);
        res.status(500).send('Terjadi kesalahan: ' + error.message);
    }
};

exports.updateSnack = async (req, res) => {
    try {
        const { id_snack, nama_snack, harga, stok, gambar_lama } = req.body;
        let gambar = gambar_lama;

        console.log('📝 Updating snack ID:', id_snack);
        console.log('📷 New file uploaded:', req.file ? 'Yes' : 'No');

        // Jika ada gambar baru diupload
        if (req.file) {
            gambar = req.file.path; // URL dari Cloudinary
            console.log('✅ New image URL from Cloudinary:', gambar);
            
            // Hapus gambar lama dari Cloudinary jika ada
            if (gambar_lama && gambar_lama.includes('cloudinary')) {
                try {
                    // Extract public_id dari URL Cloudinary
                    const urlParts = gambar_lama.split('/');
                    const filename = urlParts[urlParts.length - 1];
                    const publicId = 'warung-kasir/products/' + filename.split('.')[0];
                    
                    console.log('🗑️  Deleting old image:', publicId);
                    await cloudinary.uploader.destroy(publicId);
                    console.log('✅ Old image deleted');
                } catch (err) {
                    console.error('⚠️  Error deleting old image:', err.message);
                    // Lanjutkan meskipun gagal hapus gambar lama
                }
            }
        }

        await db.query(
            'UPDATE Snack SET nama_snack = ?, harga = ?, stok = ?, gambar = ? WHERE id_snack = ?',
            [nama_snack, harga, stok, gambar, id_snack]
        );

        console.log('✅ Snack updated successfully!');
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error updating snack:', error);
        res.json({ success: false, message: 'Terjadi kesalahan: ' + error.message });
    }
};

exports.deleteSnack = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { id_snack } = req.body;

        console.log('🗑️  Deleting snack ID:', id_snack);

        // Cek apakah snack sudah pernah digunakan di transaksi
        const [transaksi] = await connection.query(
            'SELECT COUNT(*) as count FROM Detail_Transaksi WHERE id_snack = ?',
            [id_snack]
        );

        if (transaksi[0].count > 0) {
            await connection.rollback();
            console.log('⚠️  Cannot delete: snack used in transactions');
            return res.json({ 
                success: false, 
                message: 'Snack tidak dapat dihapus karena sudah ada dalam riwayat transaksi. Anda dapat mengubah stok menjadi 0 jika ingin menonaktifkan.' 
            });
        }

        // Hapus gambar dari Cloudinary jika ada
        const [snack] = await connection.query('SELECT gambar FROM Snack WHERE id_snack = ?', [id_snack]);
        if (snack.length > 0 && snack[0].gambar && snack[0].gambar.includes('cloudinary')) {
            try {
                const urlParts = snack[0].gambar.split('/');
                const filename = urlParts[urlParts.length - 1];
                const publicId = 'warung-kasir/products/' + filename.split('.')[0];
                
                console.log('🗑️  Deleting image from Cloudinary:', publicId);
                await cloudinary.uploader.destroy(publicId);
                console.log('✅ Image deleted from Cloudinary');
            } catch (err) {
                console.error('⚠️  Error deleting image from Cloudinary:', err.message);
                // Lanjutkan penghapusan snack meskipun gagal hapus gambar
            }
        }

        // Hapus snack
        await connection.query('DELETE FROM Snack WHERE id_snack = ?', [id_snack]);

        await connection.commit();
        console.log('✅ Snack deleted successfully!');
        res.json({ success: true, message: 'Snack berhasil dihapus' });
        
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error deleting snack:', error);
        res.json({ success: false, message: 'Terjadi kesalahan: ' + error.message });
    } finally {
        connection.release();
    }
};
