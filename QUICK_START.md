# 🚀 QUICK START - CLOUDINARY SETUP

## ⚡ CARA TERCEPAT (5 Menit)

### 1. Daftar Cloudinary
👉 https://cloudinary.com/ → Sign Up (GRATIS)

### 2. Dapatkan 3 Nilai Ini
Setelah login, copy dari Dashboard:
- **Cloud name**: `xxxxxxxxxxx`
- **API Key**: `xxxxxxxxxxx`
- **API Secret**: `xxxxxxxxxxx`

### 3. Setup Local

```bash
# Install dependencies
npm install

# Copy .env
cp env.example .env

# Edit .env - ISI 3 NILAI TADI:
CLOUDINARY_CLOUD_NAME=xxxxxxxxxxx
CLOUDINARY_API_KEY=xxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxx

# Jalankan
npm start
```

### 4. Setup di Koyeb (Production)

Koyeb Dashboard → Service → **Settings** → **Environment Variables**

Tambahkan 3 variables:
```
CLOUDINARY_CLOUD_NAME = xxxxxxxxxxx
CLOUDINARY_API_KEY = xxxxxxxxxxx
CLOUDINARY_API_SECRET = xxxxxxxxxxx
```

Save → Redeploy ✅

---

## ✅ SELESAI!

Sekarang gambar tidak akan hilang lagi saat redeploy! 🎉

Upload gambar baru → Cek database → URL sekarang dari Cloudinary:
```
https://res.cloudinary.com/xxx/image/upload/xxx.jpg
```

---

## 📖 Dokumentasi Lengkap
Baca **CLOUDINARY_SETUP.md** untuk penjelasan detail.
