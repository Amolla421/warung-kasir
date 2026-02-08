-- Database Schema untuk Warung Kasir
-- Buat database
CREATE DATABASE IF NOT EXISTS warung_kasir;
USE warung_kasir;

-- Tabel User
CREATE TABLE User (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nama_user VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Snack
CREATE TABLE Snack (
    id_snack INT AUTO_INCREMENT PRIMARY KEY,
    nama_snack VARCHAR(100) NOT NULL,
    harga DECIMAL(10, 2) NOT NULL,
    stok INT NOT NULL DEFAULT 0,
    gambar VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Transaksi
CREATE TABLE Transaksi (
    id_transaksi INT AUTO_INCREMENT PRIMARY KEY,
    tanggal DATE NOT NULL,
    total_harga DECIMAL(10, 2) NOT NULL,
    id_user INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES User(id_user)
);

-- Tabel Detail_Transaksi
CREATE TABLE Detail_Transaksi (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_transaksi INT NOT NULL,
    id_snack INT NOT NULL,
    jumlah_snack INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_transaksi) REFERENCES Transaksi(id_transaksi),
    FOREIGN KEY (id_snack) REFERENCES Snack(id_snack)
);

-- Tabel Pembayaran
CREATE TABLE Pembayaran (
    id_pembayaran INT AUTO_INCREMENT PRIMARY KEY,
    id_transaksi INT NOT NULL,
    metode_pembayaran VARCHAR(50) NOT NULL,
    jumlah_bayar DECIMAL(10, 2) NOT NULL,
    kembalian DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_transaksi) REFERENCES Transaksi(id_transaksi)
);

-- Insert data admin default
INSERT INTO User (username, password, nama_user) VALUES 
('admin', '$2a$10$xQYC8vz.gVZZqXKZqXKZeOKZqXKZqXKZqXKZqXKZqXKZqXKZqXKZqX', 'Admin');
-- Password: admin123 (harus di-hash dengan bcrypt saat implementasi)

-- Insert data snack contoh
INSERT INTO Snack (nama_snack, harga, stok) VALUES 
('Chitato', 10000, 50),
('Taro', 8000, 40),
('Pocky', 12000, 30),
('Oreo', 15000, 25),
('Cheetos', 11000, 35);
