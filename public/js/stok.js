// Fungsi untuk menampilkan modal tambah
function showAddModal() {
    document.getElementById('addModal').style.display = 'block';
}

// Fungsi untuk menutup modal tambah
function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

// Fungsi untuk menampilkan modal edit
function editSnack(id, nama, harga, stok, gambar) {
    document.getElementById('edit_id_snack').value = id;
    document.getElementById('edit_nama_snack').value = nama;
    document.getElementById('edit_harga').value = harga;
    document.getElementById('edit_stok').value = stok;
    document.getElementById('edit_gambar_lama').value = gambar;
    
    const previewImg = document.getElementById('preview_gambar');
    const noGambar = document.getElementById('no_gambar');
    
    if (gambar && gambar !== '') {
        previewImg.src = gambar;
        previewImg.style.display = 'block';
        noGambar.style.display = 'none';
    } else {
        previewImg.style.display = 'none';
        noGambar.style.display = 'block';
    }
    
    document.getElementById('editModal').style.display = 'block';
}

// Fungsi untuk menutup modal edit
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Fungsi untuk update snack - FINAL VERSION
async function updateSnack() {
    const formData = new FormData();
    formData.append('id_snack', document.getElementById('edit_id_snack').value);
    formData.append('nama_snack', document.getElementById('edit_nama_snack').value);
    formData.append('harga', document.getElementById('edit_harga').value);
    formData.append('stok', document.getElementById('edit_stok').value);
    formData.append('gambar_lama', document.getElementById('edit_gambar_lama').value);
    
    const fileInput = document.getElementById('edit_gambar');
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        
        // Validasi ukuran
        if (file.size > 2 * 1024 * 1024) {
            alert('❌ File terlalu besar! Maksimal 2MB');
            return;
        }
        
        // Validasi tipe
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!allowed.includes(file.type)) {
            alert('❌ Format file tidak didukung! Gunakan JPG, PNG, atau GIF');
            return;
        }
        
        formData.append('gambar', file);
        console.log('📷 Uploading:', file.name, '-', (file.size / 1024).toFixed(2), 'KB');
    }

    try {
        console.log('🔄 Sending request...');
        
        const response = await fetch('/stok/update', {
            method: 'POST',
            body: formData
        });

        console.log('📡 Response status:', response.status, response.statusText);

        // Cek content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Response is not JSON!');
            console.error('Content-Type:', contentType);
            console.error('Response body:', text.substring(0, 300));
            throw new Error('Server tidak mengembalikan JSON. Kemungkinan ada error di backend.');
        }

        const result = await response.json();
        console.log('📦 Response data:', result);

        if (result.success) {
            alert('✅ Data berhasil diupdate!');
            location.reload();
        } else {
            alert('❌ Gagal update: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Error caught:', error);
        
        let errorMsg = 'Terjadi kesalahan saat update data.\n\n';
        errorMsg += 'Error: ' + error.message + '\n\n';
        errorMsg += 'Silakan:\n';
        errorMsg += '1. Cek Console (F12) untuk detail\n';
        errorMsg += '2. Pastikan gambar < 2MB\n';
        errorMsg += '3. Pastikan format JPG/PNG/GIF\n';
        errorMsg += '4. Cek koneksi internet\n';
        
        alert(errorMsg);
    }
}

// Fungsi untuk hapus snack
async function deleteSnack(id) {
    if (!confirm('⚠️ Yakin ingin menghapus snack ini?')) {
        return;
    }

    try {
        console.log('🗑️ Deleting snack ID:', id);
        
        const response = await fetch('/stok/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_snack: id })
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ Data berhasil dihapus!');
            location.reload();
        } else {
            alert('❌ ' + result.message);
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('Terjadi kesalahan saat menghapus data.');
    }
}

// Tutup modal jika klik di luar
window.onclick = function(event) {
    const addModal = document.getElementById('addModal');
    const editModal = document.getElementById('editModal');
    
    if (event.target == addModal) {
        addModal.style.display = 'none';
    }
    if (event.target == editModal) {
        editModal.style.display = 'none';
    }
}

// Variabel untuk tracking sort direction
let sortDirections = {
    0: 'asc',
    3: 'asc',
    4: 'asc'
};

// Fungsi untuk sort tabel
function sortTable(columnIndex) {
    const table = document.querySelector('.data-table tbody');
    const rows = Array.from(table.getElementsByTagName('tr'));
    const dataRows = rows.filter(row => row.cells.length > 1);
    
    if (dataRows.length === 0) return;
    
    const currentDirection = sortDirections[columnIndex];
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    sortDirections[columnIndex] = newDirection;
    
    document.getElementById(`sort-icon-${columnIndex}`).textContent = 
        newDirection === 'asc' ? '↑' : '↓';
    
    Object.keys(sortDirections).forEach(key => {
        if (parseInt(key) !== columnIndex) {
            document.getElementById(`sort-icon-${key}`).textContent = '↕️';
            sortDirections[key] = 'asc';
        }
    });
    
    dataRows.sort((a, b) => {
        let aValue, bValue;
        
        if (columnIndex === 0) {
            aValue = parseInt(a.cells[columnIndex].textContent);
            bValue = parseInt(b.cells[columnIndex].textContent);
        } else if (columnIndex === 3) {
            aValue = parseInt(a.cells[columnIndex].textContent.replace(/[Rp.\s]/g, ''));
            bValue = parseInt(b.cells[columnIndex].textContent.replace(/[Rp.\s]/g, ''));
        } else if (columnIndex === 4) {
            aValue = parseInt(a.cells[columnIndex].textContent);
            bValue = parseInt(b.cells[columnIndex].textContent);
        }
        
        if (newDirection === 'asc') {
            return aValue - bValue;
        } else {
            return bValue - aValue;
        }
    });
    
    dataRows.forEach(row => table.appendChild(row));
}

// Fungsi search untuk tabel stok
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchStok');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const filter = this.value.toLowerCase();
            const table = document.querySelector('.data-table tbody');
            const rows = table.getElementsByTagName('tr');

            for (let i = 0; i < rows.length; i++) {
                const nameCell = rows[i].getElementsByTagName('td')[2];
                if (nameCell) {
                    const textValue = nameCell.textContent || nameCell.innerText;
                    if (textValue.toLowerCase().indexOf(filter) > -1) {
                        rows[i].style.display = '';
                    } else {
                        rows[i].style.display = 'none';
                    }
                }
            }
        });
    }
    
    console.log('✅ Stok page loaded');
});
