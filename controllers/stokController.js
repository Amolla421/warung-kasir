const db = require('../config/database');
const { cloudinary, upload, uploadToCloudinary } = require('../config/cloudinary');

exports.upload = upload;

exports.index = async (req, res) => {
    try {
        const [snacks] = await db.query('SELECT * FROM Snack ORDER BY id_snack ASC');
        snacks.forEach((snack, index) => {
            snack.harga = Math.floor(snack.harga);
            snack.no = index + 1;
        });
        res.render('stok', {
            user: req.session.user,
            snacks
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).send('Terjadi kesalahan');
    }
};

exports.addSnack = async (req, res) => {
    try {
        const { nama_snack, harga, stok } = req.body;
        let gambar = null;

        console.log('📝 Adding:', nama_snack);

        if (req.file) {
            console.log('📤 Uploading image...');
            const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
            gambar = result.secure_url;
        }

        await db.query(
            'INSERT INTO Snack (nama_snack, harga, stok, gambar) VALUES (?, ?, ?, ?)',
            [nama_snack, harga, stok, gambar]
        );

        console.log('✅ Snack added!');
        res.redirect('/stok');
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).send('Terjadi kesalahan: ' + error.message);
    }
};

exports.updateSnack = async (req, res) => {
    try {
        const { id_snack, nama_snack, harga, stok, gambar_lama } = req.body;
        let gambar = gambar_lama;

        console.log('📝 Updating snack ID:', id_snack);

        if (req.file) {
            console.log('📤 Uploading new image...');
            
            try {
                const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
                gambar = result.secure_url;
                console.log('✅ New image uploaded');
                
                if (gambar_lama && gambar_lama.includes('cloudinary')) {
                    try {
                        const urlParts = gambar_lama.split('/');
                        const filename = urlParts[urlParts.length - 1];
                        const publicId = 'warung-kasir/products/' + filename.split('.')[0];
                        await cloudinary.uploader.destroy(publicId);
                        console.log('🗑️ Old image deleted');
                    } catch (deleteError) {
                        console.error('⚠️ Failed to delete old image:', deleteError.message);
                    }
                }
            } catch (uploadError) {
                console.error('❌ Upload failed:', uploadError);
                throw new Error('Gagal upload gambar: ' + uploadError.message);
            }
        }

        await db.query(
            'UPDATE Snack SET nama_snack = ?, harga = ?, stok = ?, gambar = ? WHERE id_snack = ?',
            [nama_snack, harga, stok, gambar, id_snack]
        );

        console.log('✅ Snack updated!');
        res.json({ success: true, message: 'Snack berhasil diupdate!' });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSnack = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        const { id_snack } = req.body;

        const [transaksi] = await connection.query(
            'SELECT COUNT(*) as count FROM Detail_Transaksi WHERE id_snack = ?',
            [id_snack]
        );

        if (transaksi[0].count > 0) {
            await connection.rollback();
            return res.json({ 
                success: false, 
                message: 'Snack tidak dapat dihapus karena sudah ada dalam riwayat transaksi.' 
            });
        }

        const [snack] = await connection.query('SELECT gambar FROM Snack WHERE id_snack = ?', [id_snack]);
        if (snack.length > 0 && snack[0].gambar && snack[0].gambar.includes('cloudinary')) {
            try {
                const urlParts = snack[0].gambar.split('/');
                const filename = urlParts[urlParts.length - 1];
                const publicId = 'warung-kasir/products/' + filename.split('.')[0];
                await cloudinary.uploader.destroy(publicId);
                console.log('🗑️ Image deleted');
            } catch (err) {
                console.error('⚠️ Delete image error:', err.message);
            }
        }

        await connection.query('DELETE FROM Snack WHERE id_snack = ?', [id_snack]);
        await connection.commit();
        
        res.json({ success: true, message: 'Snack berhasil dihapus' });
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error:', error);
        res.json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};
