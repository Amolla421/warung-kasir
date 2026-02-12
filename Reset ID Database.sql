USE warung_kasir;

SET FOREIGN_KEY_CHECKS = 0;

CREATE TEMPORARY TABLE Snack_Temp (
    id_snack INT,
    nama_snack VARCHAR(100),
    harga DECIMAL(10, 2),
    stok INT,
    gambar VARCHAR(255),
    created_at TIMESTAMP
);

-- Backup data
INSERT INTO Snack_Temp 
SELECT id_snack, nama_snack, harga, stok, gambar, created_at
FROM Snack
ORDER BY id_snack;

-- Reset
DELETE FROM Snack;
ALTER TABLE Snack AUTO_INCREMENT = 1;

-- Restore
INSERT INTO Snack (nama_snack, harga, stok, gambar, created_at)
SELECT nama_snack, harga, stok, gambar, created_at
FROM Snack_Temp
ORDER BY id_snack;

DROP TEMPORARY TABLE Snack_Temp;


CREATE TEMPORARY TABLE Transaksi_Backup (
    old_id INT,
    id_user INT,
    tanggal DATE,
    total_harga DECIMAL(10,2),
    created_at TIMESTAMP
);

INSERT INTO Transaksi_Backup
SELECT id_transaksi, id_user, tanggal, total_harga, created_at
FROM Transaksi
ORDER BY id_transaksi;

-- Backup Pembayaran
CREATE TEMPORARY TABLE Pembayaran_Backup (
    old_id_transaksi INT,
    metode_pembayaran VARCHAR(50),
    jumlah_bayar DECIMAL(10,2),
    kembalian DECIMAL(10,2),
    created_at TIMESTAMP
);

INSERT INTO Pembayaran_Backup
SELECT id_transaksi, metode_pembayaran, jumlah_bayar, kembalian, created_at
FROM Pembayaran;

-- Backup Detail_Transaksi
CREATE TEMPORARY TABLE Detail_Transaksi_Backup (
    old_id_transaksi INT,
    id_snack INT,
    jumlah_snack INT,
    subtotal DECIMAL(10,2)
);

INSERT INTO Detail_Transaksi_Backup
SELECT id_transaksi, id_snack, jumlah_snack, subtotal
FROM Detail_Transaksi;

DELETE FROM Pembayaran;
DELETE FROM Detail_Transaksi;
DELETE FROM Transaksi;

ALTER TABLE Transaksi AUTO_INCREMENT = 1;
ALTER TABLE Pembayaran AUTO_INCREMENT = 1;
ALTER TABLE Detail_Transaksi AUTO_INCREMENT = 1;

INSERT INTO Transaksi (id_user, tanggal, total_harga, created_at)
SELECT id_user, tanggal, total_harga, created_at
FROM Transaksi_Backup
ORDER BY old_id;

CREATE TEMPORARY TABLE ID_Mapping (
    old_id INT,
    new_id INT
);

SET @row_number = 0;
INSERT INTO ID_Mapping (old_id, new_id)
SELECT old_id, (@row_number := @row_number + 1) as new_id
FROM Transaksi_Backup
ORDER BY old_id;

INSERT INTO Pembayaran (id_transaksi, metode_pembayaran, jumlah_bayar, kembalian, created_at)
SELECT m.new_id, p.metode_pembayaran, p.jumlah_bayar, p.kembalian, p.created_at
FROM Pembayaran_Backup p
JOIN ID_Mapping m ON p.old_id_transaksi = m.old_id;

INSERT INTO Detail_Transaksi (id_transaksi, id_snack, jumlah_snack, subtotal)
SELECT m.new_id, d.id_snack, d.jumlah_snack, d.subtotal
FROM Detail_Transaksi_Backup d
JOIN ID_Mapping m ON d.old_id_transaksi = m.old_id;

DROP TEMPORARY TABLE Transaksi_Backup;
DROP TEMPORARY TABLE Pembayaran_Backup;
DROP TEMPORARY TABLE Detail_Transaksi_Backup;
DROP TEMPORARY TABLE ID_Mapping;

SET FOREIGN_KEY_CHECKS = 1;


SELECT 
    t.id_transaksi,
    DATE_FORMAT(t.tanggal, '%d/%m/%Y') AS tanggal,
    t.total_harga,
    u.nama_user,
    p.metode_pembayaran
FROM Transaksi t
JOIN User u ON t.id_user = u.id_user
LEFT JOIN Pembayaran p ON t.id_transaksi = p.id_transaksi
ORDER BY t.id_transaksi;