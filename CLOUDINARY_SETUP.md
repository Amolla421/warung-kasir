# 🖼️ PANDUAN SETUP CLOUDINARY - SOLUSI GAMBAR PERSISTEN

## ❌ MASALAH
Gambar hilang setiap kali redeploy karena disimpan di file system lokal yang bersifat **ephemeral** (sementara).

## ✅ SOLUSI
Menggunakan **Cloudinary** - cloud storage gratis untuk menyimpan gambar secara permanen.

---

## 📋 LANGKAH-LANGKAH SETUP

### 1️⃣ DAFTAR CLOUDINARY (GRATIS)

1. Kunjungi: https://cloudinary.com/
2. Klik **"Sign Up for Free"**
3. Isi data atau gunakan Google/GitHub untuk daftar
4. Setelah login, Anda akan melihat **Dashboard**

### 2️⃣ DAPATKAN CREDENTIALS

Di halaman Dashboard Cloudinary, Anda akan melihat:

```
Cloud name: xxxxxxxx
API Key: xxxxxxxxxxxxxxxxx
API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**PENTING:** Simpan ketiga nilai ini!

### 3️⃣ SETUP PROJECT

#### A. Install Dependencies Baru

```bash
npm install
```

Dependencies yang ditambahkan:
- `cloudinary` - SDK Cloudinary
- `multer-storage-cloudinary` - Integrasi Multer dengan Cloudinary

#### B. Konfigurasi Environment Variables

1. **Copy file .env**:
```bash
cp env.example .env
```

2. **Edit file .env** dan isi credentials Cloudinary:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=warung_kasir
DB_PORT=3306

# Session Secret
SESSION_SECRET=your-secret-key-here-change-this-to-random-string

# Cloudinary Configuration - ISI DENGAN DATA DARI CLOUDINARY DASHBOARD!
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Port
PORT=3000
```

**GANTI** `your_cloud_name_here`, `your_api_key_here`, dan `your_api_secret_here` dengan data dari Cloudinary!

### 4️⃣ SETUP DI KOYEB (DEPLOYMENT)

1. Login ke **Koyeb**
2. Buka service **warung-kasir**
3. Klik **Settings** → **Environment Variables**
4. Tambahkan 3 environment variables baru:

```
CLOUDINARY_CLOUD_NAME = xxxxxxxx
CLOUDINARY_API_KEY = xxxxxxxxxxxxxxxxx
CLOUDINARY_API_SECRET = xxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. Klik **Save**
6. Redeploy aplikasi

---

## 🔄 PERUBAHAN YANG DILAKUKAN

### File yang Diubah/Ditambahkan:

1. ✅ **package.json** - Menambahkan dependencies cloudinary
2. ✅ **config/cloudinary.js** - Konfigurasi Cloudinary (BARU)
3. ✅ **controllers/stokController.js** - Menggunakan Cloudinary untuk upload
4. ✅ **env.example** - Menambahkan config Cloudinary

### Cara Kerja Baru:

**SEBELUM** (File System Lokal):
```
Upload → public/images/products/xxx.jpg → Database: /images/products/xxx.jpg
         ❌ HILANG SAAT REDEPLOY
```

**SESUDAH** (Cloudinary):
```
Upload → Cloudinary Cloud → Database: https://res.cloudinary.com/xxx/image/upload/xxx.jpg
         ✅ PERMANEN, TIDAK HILANG
```

---

## 🎯 KEUNTUNGAN MENGGUNAKAN CLOUDINARY

✅ **Gambar Tidak Hilang** saat redeploy
✅ **Gratis** untuk 25GB storage + 25GB bandwidth/bulan
✅ **Auto Resize** - Gambar otomatis di-resize ke 500x500px
✅ **CDN Global** - Loading gambar lebih cepat di seluruh dunia
✅ **Auto Backup** - Tidak perlu khawatir kehilangan data
✅ **Easy Management** - Bisa manage gambar via Dashboard Cloudinary

---

## 🧪 TESTING

Setelah setup:

1. Jalankan aplikasi:
```bash
npm start
```

2. Buka aplikasi → **Inventory** → **Tambah Snack**
3. Upload gambar produk baru
4. Cek di database - sekarang kolom `gambar` berisi URL Cloudinary:
   ```
   https://res.cloudinary.com/your_cloud_name/image/upload/v1234567/warung-kasir/products/xxx.jpg
   ```

5. **REDEPLOY** aplikasi - gambar tetap ada! ✅

---

## 🔍 TROUBLESHOOTING

### Error: "Invalid Cloudinary credentials"
➡️ Pastikan CLOUDINARY_CLOUD_NAME, API_KEY, dan API_SECRET sudah benar di file .env

### Gambar tidak muncul
➡️ Cek di browser console, pastikan URL Cloudinary bisa diakses

### Error saat upload
➡️ Pastikan ukuran file < 2MB
➡️ Format file harus: JPG, JPEG, PNG, atau GIF

---

## 📱 MIGRASI DATA LAMA

Jika Anda sudah punya gambar di folder `public/images/products/`:

1. **Manual Upload** ke Cloudinary:
   - Login ke Cloudinary Dashboard
   - Upload gambar satu per satu ke folder `warung-kasir/products`
   - Copy URL yang dihasilkan

2. **Update Database**:
```sql
UPDATE Snack 
SET gambar = 'https://res.cloudinary.com/xxx/image/upload/xxx.jpg' 
WHERE id_snack = 1;
```

---

## 🆘 SUPPORT

Jika ada masalah:
1. Cek file `.env` - apakah credentials Cloudinary sudah benar?
2. Cek Console/Terminal - ada error message?
3. Cek Cloudinary Dashboard - apakah gambar ter-upload?

---

## 📞 CONTACT

Dibuat dengan ❤️ untuk Warung Afaa' Snack
