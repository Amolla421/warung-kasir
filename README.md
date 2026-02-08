# Aplikasi Kasir Warung Snack - Afaa' Snack

Aplikasi kasir berbasis web untuk warung snack dengan fitur lengkap: kasir, inventory, dan laporan penjualan.

## Fitur Utama

- **Login & Autentikasi**: Login, Register, Lupa Password
- **Dashboard**: Statistik transaksi hari ini, penjualan, dan stok
- **Kasir**: Point of Sale (POS) dengan keranjang belanja dan pembayaran
- **Inventory**: Manajemen stok snack (tambah, edit, hapus)
- **Laporan Penjualan**: Laporan transaksi berdasarkan bulan dan tahun

## Teknologi

- Node.js + Express
- MySQL (MySQL Workbench)
- EJS Template Engine
- Vanilla JavaScript
- CSS3

## Instalasi

### 1. Clone/Download Project

Ekstrak file project ke folder yang diinginkan.

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

1. Buka MySQL Workbench
2. Buat koneksi baru atau gunakan yang sudah ada
3. Jalankan script SQL dari file `database.sql` untuk membuat database dan tabel
4. Update file `.env` sesuai konfigurasi MySQL Anda:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=warung_kasir
PORT=3000
SESSION_SECRET=warung_kasir_secret_key_2024
```

### 4. Hash Password Admin

Jalankan script berikut untuk membuat hash password admin:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('admin123', 10));"
```

Copy hasil hash dan update di database.sql atau langsung di MySQL Workbench:

```sql
INSERT INTO User (username, password, nama_user) VALUES 
('admin', 'PASTE_HASH_DI_SINI', 'Admin');
```

### 5. Jalankan Aplikasi

```bash
npm start
```

Atau untuk development dengan auto-reload:

```bash
npm run dev
```

### 6. Akses Aplikasi

Buka browser dan akses: `http://localhost:3000`

**Login Default:**
- Username: admin
- Password: admin123

## Struktur Project

```
warung-kasir/
├── config/
│   └── database.js          # Konfigurasi database
├── controllers/
│   ├── authController.js    # Controller autentikasi
│   ├── dashboardController.js
│   ├── kasirController.js
│   ├── stokController.js
│   └── laporanController.js
├── models/                  # (Opsional untuk model)
├── public/
│   ├── css/
│   │   └── style.css       # Stylesheet utama
│   ├── js/
│   │   ├── kasir.js        # JavaScript untuk halaman kasir
│   │   └── stok.js         # JavaScript untuk halaman stok
│   └── images/             # Folder untuk logo dan gambar produk
├── routes/
│   ├── auth.js             # Routes autentikasi
│   ├── dashboard.js
│   ├── kasir.js
│   ├── stok.js
│   └── laporan.js
├── views/
│   ├── login.ejs
│   ├── lupa-password.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── kasir.ejs
│   ├── stok.ejs
│   ├── laporan.ejs
│   └── detail-transaksi.ejs
├── .env                    # Konfigurasi environment
├── database.sql           # Script SQL database
├── package.json
└── server.js             # Entry point aplikasi
```

## Cara Penggunaan

### Menambahkan Logo dan Gambar Produk

1. **Logo Aplikasi**: 
   - Letakkan file logo di folder `public/images/`
   - Edit file `views/login.ejs` dan `views/dashboard.ejs` 
   - Ganti bagian `<div class="logo-placeholder">` dengan `<img src="/images/logo.png">`

2. **Gambar Produk**:
   - Letakkan gambar produk di folder `public/images/products/`
   - Edit file `views/kasir.ejs`
   - Ganti bagian `<div class="image-placeholder">` dengan `<img src="/images/products/nama-produk.jpg">`

### Workflow Transaksi (Sesuai Flowchart)

1. **Login** → Masuk dengan username dan password
2. **Dashboard** → Lihat statistik
3. **Kasir** → Pilih produk → Input jumlah → Tambah ke keranjang
4. **Pembayaran** → Pilih metode → Input jumlah bayar → Bayar
5. **Sistem** → Kurangi stok otomatis → Simpan transaksi

### Laporan Penjualan

1. Pilih bulan dan tahun
2. Klik Filter
3. Lihat rincian transaksi
4. Klik Detail untuk melihat detail transaksi
5. Cetak struk jika diperlukan

## Database Schema (Sesuai ERD)

- **User**: Menyimpan data pengguna/kasir
- **Snack**: Menyimpan data produk snack
- **Transaksi**: Menyimpan header transaksi
- **Detail_Transaksi**: Menyimpan detail item per transaksi
- **Pembayaran**: Menyimpan data pembayaran

## Lisensi

Aplikasi ini dibuat untuk keperluan warung snack.
