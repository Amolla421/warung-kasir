USE warung_kasir;

DROP TABLE IF EXISTS Snack_Backup;
DROP TABLE IF EXISTS User_Backup;
DROP TABLE IF EXISTS Transaksi_Backup;
DROP TABLE IF EXISTS Detail_Transaksi_Backup;
DROP TABLE IF EXISTS Pembayaran_Backup;

CREATE TABLE User_Backup (
    id_user INT,
    username VARCHAR(50),
    password VARCHAR(255),
    nama_user VARCHAR(100),
    created_at TIMESTAMP
);

-- Snack Backup
CREATE TABLE Snack_Backup (
    id_snack INT,
    nama_snack VARCHAR(100),
    harga DECIMAL(10, 2),
    stok INT,
    gambar VARCHAR(255),
    created_at TIMESTAMP
);

-- Transaksi Backup
CREATE TABLE Transaksi_Backup (
    id_transaksi INT,
    tanggal DATE,
    total_harga DECIMAL(10, 2),
    id_user INT,
    created_at TIMESTAMP
);

-- Detail Transaksi Backup
CREATE TABLE Detail_Transaksi_Backup (
    id_detail INT,
    id_transaksi INT,
    id_snack INT,
    jumlah_snack INT,
    subtotal DECIMAL(10, 2)
);

-- Pembayaran Backup
CREATE TABLE Pembayaran_Backup (
    id_pembayaran INT,
    id_transaksi INT,
    metode_pembayaran VARCHAR(50),
    jumlah_bayar DECIMAL(10, 2),
    kembalian DECIMAL(10, 2),
    created_at TIMESTAMP
);

INSERT INTO User_Backup 
SELECT id_user, username, password, nama_user, created_at
FROM User;

INSERT INTO Snack_Backup 
SELECT id_snack, nama_snack, harga, stok, gambar, created_at
FROM Snack;

INSERT INTO Transaksi_Backup 
SELECT id_transaksi, tanggal, total_harga, id_user, created_at
FROM Transaksi;

INSERT INTO Detail_Transaksi_Backup 
SELECT id_detail, id_transaksi, id_snack, jumlah_snack, subtotal
FROM Detail_Transaksi;

INSERT INTO Pembayaran_Backup 
SELECT id_pembayaran, id_transaksi, metode_pembayaran, jumlah_bayar, kembalian, created_at
FROM Pembayaran;

-- Cek backup
SELECT 'Backup Complete!' as status;
SELECT 'User' as tabel, COUNT(*) as jumlah FROM User_Backup
UNION ALL
SELECT 'Snack', COUNT(*) FROM Snack_Backup
UNION ALL
SELECT 'Transaksi', COUNT(*) FROM Transaksi_Backup
UNION ALL
SELECT 'Detail', COUNT(*) FROM Detail_Transaksi_Backup
UNION ALL
SELECT 'Pembayaran', COUNT(*) FROM Pembayaran_Backup;

SET FOREIGN_KEY_CHECKS = 0;


TRUNCATE TABLE Pembayaran;
TRUNCATE TABLE Detail_Transaksi;
TRUNCATE TABLE Transaksi;
TRUNCATE TABLE Snack;
TRUNCATE TABLE User;

SELECT 'Tables Truncated!' as status;


ALTER TABLE User AUTO_INCREMENT = 1;
ALTER TABLE Snack AUTO_INCREMENT = 1;
ALTER TABLE Transaksi AUTO_INCREMENT = 1;
ALTER TABLE Detail_Transaksi AUTO_INCREMENT = 1;
ALTER TABLE Pembayaran AUTO_INCREMENT = 1;

SELECT 'AUTO_INCREMENT Reset to 1!' as status;


INSERT INTO User (username, password, nama_user, created_at)
SELECT username, password, nama_user, created_at
FROM User_Backup 
ORDER BY id_user;

SELECT 'User Restored!' as status;
SELECT * FROM User;


INSERT INTO Snack (nama_snack, harga, stok, gambar, created_at)
SELECT nama_snack, harga, stok, gambar, created_at 
FROM Snack_Backup 
ORDER BY id_snack;

SELECT 'Snack Restored!' as status;
SELECT * FROM Snack;


SET FOREIGN_KEY_CHECKS = 1;

SELECT '========================================' as '';
SELECT '✅ RESET COMPLETE! ID MULAI DARI 1' as RESULT;
SELECT '========================================' as '';

SELECT 'User' as Tabel, 
       COUNT(*) as Total, 
       COALESCE(MIN(id_user), 0) as ID_Pertama, 
       COALESCE(MAX(id_user), 0) as ID_Terakhir 
FROM User
UNION ALL
SELECT 'Snack', 
       COUNT(*), 
       COALESCE(MIN(id_snack), 0), 
       COALESCE(MAX(id_snack), 0) 
FROM Snack
UNION ALL
SELECT 'Transaksi', 
       COUNT(*), 
       COALESCE(MIN(id_transaksi), 0), 
       COALESCE(MAX(id_transaksi), 0) 
FROM Transaksi;

