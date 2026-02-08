# 🎉 Warung Kasir - Display Number Feature

## 📦 Yang Sudah Ditambahkan

Project ini sudah **dimodifikasi** dengan fitur **Display Number** untuk semua tabel:

✅ **Inventory (Stok)** - Nomor urut 1, 2, 3...  
✅ **Laporan Penjualan** - Nomor urut + Display ID (#000001, #000002...)  
✅ **Detail Transaksi** - Nomor urut untuk rincian barang  

---

## 🚀 Cara Install & Jalankan

### 1. Extract File
```bash
unzip warung-kasir-updated.zip
cd warung-kasir-updated
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database
- Buka file `database.sql`
- Import ke TiDB Cloud atau MySQL Anda
- Atau jalankan script reset ID yang sudah Anda punya

### 4. Setup Environment
```bash
cp env.example .env
```

Edit file `.env` dengan konfigurasi database Anda:
```
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=warung_kasir
SESSION_SECRET=your_secret_key
```

### 5. Jalankan Server
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

---

## 📊 Apa yang Berubah?

### **Sebelum:**
```
Inventory:
┌────┬─────────┬────────┬──────┐
│ ID │ Nama    │ Harga  │ Stok │
├────┼─────────┼────────┼──────┤
│ 1  │ Chitato │ 10,000 │  50  │
│ 5  │ Taro    │  8,000 │  40  │  ← Gap di ID
│ 7  │ Pocky   │ 12,000 │  30  │
└────┴─────────┴────────┴──────┘
```

### **Sesudah:**
```
Inventory:
┌────┬─────────┬────────┬──────┐
│ No │ Nama    │ Harga  │ Stok │
├────┼─────────┼────────┼──────┤
│ 1  │ Chitato │ 10,000 │  50  │
│ 2  │ Taro    │  8,000 │  40  │  ← Nomor berurutan!
│ 3  │ Pocky   │ 12,000 │  30  │
└────┴─────────┴────────┴──────┘
```

---

## 🎯 Fitur Utama

### 1. **Nomor Urut Otomatis**
- Setiap tabel punya nomor urut 1, 2, 3...
- Otomatis update saat ada data dihapus
- Tidak perlu reset database manual

### 2. **Display ID Cantik**
- Format: `#000001`, `#000002`, `#000003`
- Mudah dibaca dan professional
- Tetap pakai ID asli untuk operasi database

### 3. **Aman & Tidak Merusak Data**
- ID database asli **tidak berubah**
- Relasi antar tabel **tetap valid**
- Data historis **tetap konsisten**

---

## 📁 File yang Dimodifikasi

| File | Perubahan |
|------|-----------|
| `controllers/stokController.js` | ✨ Tambah `snack.no` |
| `controllers/laporanController.js` | ✨ Tambah `laporan.no` & `laporan.display_id` |
| `views/stok.ejs` | 🎨 Kolom ID → No |
| `views/laporan.ejs` | 🎨 Tambah kolom No & Display ID |
| `views/detail-transaksi.ejs` | 🎨 Tambah kolom No |

Detail lengkap perubahan ada di file `CHANGELOG.md`

---

## 🔧 Troubleshooting

### Error: "Cannot find module..."
```bash
npm install
```

### Port 3000 sudah dipakai
Edit `server.js` line terakhir, ganti port:
```javascript
const PORT = process.env.PORT || 5000; // Ganti 3000 → 5000
```

### Database connection error
Pastikan:
- ✅ File `.env` sudah diisi dengan benar
- ✅ Database TiDB Cloud sudah running
- ✅ IP Anda sudah di-whitelist di TiDB Cloud

---

## 📸 Screenshot Hasil

### Inventory Page
```
┌────┬─────────┬────────┬──────┬──────────────┐
│ No │ Gambar  │ Nama   │ Harga│ Stok │ Aksi │
├────┼─────────┼────────┼──────┼──────┼──────┤
│ 1  │ [img]   │Chitato │10,000│  50  │ ... │
│ 2  │ [img]   │ Taro   │ 8,000│  40  │ ... │
│ 3  │ [img]   │ Pocky  │12,000│  30  │ ... │
└────┴─────────┴────────┴──────┴──────┴──────┘
```

### Laporan Penjualan
```
┌────┬──────────┬────────────┬───────┬────────┐
│ No │    ID    │  Tanggal   │ Waktu │ Total  │
├────┼──────────┼────────────┼───────┼────────┤
│ 1  │ #000001  │ 08/02/2026 │ 08:45 │ 50,000 │
│ 2  │ #000002  │ 08/02/2026 │ 10:30 │ 75,000 │
│ 3  │ #000003  │ 07/02/2026 │ 14:15 │ 25,000 │
└────┴──────────┴────────────┴───────┴────────┘
```

---

## 💡 Cara Kerja Teknis

### Backend (Controller)
```javascript
// Fetch data dari database
const [snacks] = await db.query('SELECT * FROM Snack ORDER BY id_snack');

// Tambahkan nomor urut
snacks.forEach((snack, index) => {
    snack.no = index + 1; // 1, 2, 3...
});

// Kirim ke view
res.render('stok', { snacks });
```

### Frontend (EJS View)
```html
<% snacks.forEach(snack => { %>
    <tr>
        <td><%= snack.no %></td>  <!-- Display nomor urut -->
        <td><%= snack.nama_snack %></td>
        ...
    </tr>
<% }) %>
```

**Hasil:** Nomor urut selalu berurutan 1, 2, 3... tanpa gap!

---

## 🎓 Penjelasan untuk Pemula

### Kenapa Pakai Display Number?

**Masalah:**
- Kamu hapus item dengan ID 2
- Sekarang ID kamu: 1, 3, 4, 5
- User bingung: "Kok loncat dari 1 ke 3?"

**Solusi:**
- ID database tetap: 1, 3, 4, 5
- Nomor display: 1, 2, 3, 4
- User senang, database aman!

### Apakah ID Database Berubah?

**TIDAK!** ID database (`id_snack`, `id_transaksi`) **tetap sama**.

Yang berubah hanya **tampilan** di table untuk user.

---

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Baca file `CHANGELOG.md` untuk detail perubahan
2. Check troubleshooting di atas
3. Pastikan semua dependencies sudah terinstall

---

## ✨ Features Checklist

- [x] Display Number untuk Inventory
- [x] Display Number untuk Laporan Penjualan  
- [x] Display Number untuk Detail Transaksi
- [x] Display ID dengan format #000001
- [x] Auto-reorder saat hapus data
- [x] Tidak merusak data existing

---

**Happy Coding! 🚀**

Dibuat dengan ❤️ untuk Warung Kasir Afaa' Snack
