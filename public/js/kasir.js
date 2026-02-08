// Fungsi untuk menambah item ke keranjang
async function addToCart(idSnack) {
    const jumlah = document.getElementById(`jumlah-${idSnack}`).value;
    
    try {
        const response = await fetch('/kasir/add-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_snack: idSnack, jumlah: parseInt(jumlah) })
        });

        const result = await response.json();

        if (result.success) {
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan');
    }
}

// Fungsi untuk menghapus item dari keranjang
async function removeFromCart(idSnack) {
    try {
        const response = await fetch('/kasir/remove-item', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_snack: idSnack })
        });

        const result = await response.json();

        if (result.success) {
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan');
    }
}

// Fungsi untuk membersihkan keranjang
async function clearCart() {
    if (!confirm('Yakin ingin membersihkan keranjang?')) {
        return;
    }

    try {
        const response = await fetch('/kasir/clear-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan');
    }
}

// Fungsi untuk checkout
async function checkout() {
    const metodePembayaran = document.getElementById('metodePembayaran').value;
    const jumlahBayar = document.getElementById('jumlahBayar').value;

    if (!jumlahBayar || parseFloat(jumlahBayar) <= 0) {
        alert('Masukkan jumlah pembayaran');
        return;
    }

    try {
        const response = await fetch('/kasir/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                metode_pembayaran: metodePembayaran,
                jumlah_bayar: parseFloat(jumlahBayar)
            })
        });

        const result = await response.json();

        if (result.success) {
            alert(`Transaksi berhasil!\nKembalian: Rp ${result.kembalian.toLocaleString('id-ID')}`);
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan');
    }
}

// Hitung kembalian otomatis
document.addEventListener('DOMContentLoaded', function() {
    const jumlahBayarInput = document.getElementById('jumlahBayar');
    const kembalianInput = document.getElementById('kembalian');
    const totalElement = document.getElementById('total');

    if (jumlahBayarInput && kembalianInput && totalElement) {
        jumlahBayarInput.addEventListener('input', function() {
            const total = parseFloat(totalElement.textContent.replace(/[^0-9]/g, '')) || 0;
            const bayar = parseFloat(this.value) || 0;
            const kembalian = bayar - total;

            if (kembalian >= 0) {
                kembalianInput.value = 'Rp ' + kembalian.toLocaleString('id-ID');
            } else {
                kembalianInput.value = 'Rp 0';
            }
        });
    }

    // Fungsi search produk
    const searchInput = document.getElementById('searchProduk');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const filter = this.value.toLowerCase();
            const cards = document.querySelectorAll('.produk-card');

            cards.forEach(function(card) {
                const name = card.querySelector('h3').textContent.toLowerCase();
                if (name.indexOf(filter) > -1) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});
