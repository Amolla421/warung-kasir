const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Debug: Log environment variables (without showing full values for security)
console.log('🔍 Checking Cloudinary environment variables...');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set (' + process.env.CLOUDINARY_CLOUD_NAME.substring(0, 3) + '***)' : '❌ Not set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set (' + process.env.CLOUDINARY_API_KEY.substring(0, 3) + '***)' : '❌ Not set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set (***hidden***)' : '❌ Not set');

// Konfigurasi Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Test koneksi saat startup (hanya jika semua credentials tersedia)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    console.log('📡 Testing Cloudinary connection...');
    cloudinary.api.ping()
        .then(() => {
            console.log('✅ Cloudinary connected successfully!');
            console.log('✅ Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
        })
        .catch(err => {
            console.error('❌ Cloudinary connection failed!');
            console.error('Error:', err.message);
            console.error('Error details:', err);
        });
} else {
    console.error('⚠️  Cloudinary credentials MISSING!');
    console.error('Please set these environment variables in Koyeb:');
    console.error('- CLOUDINARY_CLOUD_NAME');
    console.error('- CLOUDINARY_API_KEY');
    console.error('- CLOUDINARY_API_SECRET');
}

// Multer dengan memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(file.originalname.split('.').pop().toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Hanya file gambar (JPG, PNG, GIF) yang diperbolehkan!'));
        }
    }
});

// Fungsi helper untuk upload buffer ke Cloudinary
async function uploadToCloudinary(fileBuffer, filename) {
    return new Promise((resolve, reject) => {
        // Validasi credentials
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('❌ Upload failed: Cloudinary credentials tidak tersedia');
            return reject(new Error('Cloudinary credentials tidak tersedia. Periksa environment variables di Koyeb.'));
        }

        console.log('📤 Uploading to Cloudinary...');
        console.log('   Cloud:', process.env.CLOUDINARY_CLOUD_NAME);
        console.log('   File:', filename);

        const uniqueFilename = `${Date.now()}-${filename.split('.')[0]}`;
        
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'warung-kasir/products',
                public_id: uniqueFilename,
                resource_type: 'auto',
                transformation: [{ width: 500, height: 500, crop: 'limit' }]
            },
            (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary upload error:', error);
                    reject(error);
                } else {
                    console.log('✅ Upload success!');
                    console.log('   URL:', result.secure_url);
                    resolve(result);
                }
            }
        );

        const readableStream = Readable.from(fileBuffer);
        readableStream.pipe(uploadStream);
    });
}

module.exports = { cloudinary, upload, uploadToCloudinary };
