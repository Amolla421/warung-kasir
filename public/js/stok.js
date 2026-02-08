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
    
    // Preview gambar
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

// Fungsi untuk update snack
async function updateSnack() {
    const formData = new FormData();
    formData.append('id_snack', document.getElementById('edit_id_snack').value);
    formData.append('nama_snack', document.getElementById('edit_nama_snack').value);
    formData.append('harga', document.getElementById('edit_harga').value);
    formData.append('stok', document.getElementById('edit_stok').value);
    formData.append('gambar_lama', document.getElementById('edit_gambar_lama').value);
    
    const fileInput = document.getElementById('edit_gambar');
    if (fileInput.files.length > 0) {
        formData.append('gambar', fileInput.files[0]);
    }

    try {
        const response = await fetch('/stok/update', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            alert('Data berhasil diupdate');
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan');
    }
}

// Fungsi untuk hapus snack
async function deleteSnack(id) {
    if (!confirm('Yakin ingin menghapus snack ini?')) {
        return;
    }

    try {
        const response = await fetch('/stok/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_snack: id })
        });

        const result = await response.json();

        if (result.success) {
            alert('Data berhasil dihapus');
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan');
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
    0: 'asc',  // ID
    3: 'asc',  // Harga
    4: 'asc'   // Stok
};

// Fungsi untuk sort tabel
function sortTable(columnIndex) {
    const table = document.querySelector('.data-table tbody');
    const rows = Array.from(table.getElementsByTagName('tr'));
    
    // Filter rows yang bukan "Belum ada data"
    const dataRows = rows.filter(row => row.cells.length > 1);
    
    if (dataRows.length === 0) return;
    
    // Toggle sort direction
    const currentDirection = sortDirections[columnIndex];
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
    sortDirections[columnIndex] = newDirection;
    
    // Update icon
    document.getElementById(`sort-icon-${columnIndex}`).textContent = 
        newDirection === 'asc' ? '↑' : '↓';
    
    // Reset icon kolom lain
    Object.keys(sortDirections).forEach(key => {
        if (parseInt(key) !== columnIndex) {
            document.getElementById(`sort-icon-${key}`).textContent = '↕️';
            sortDirections[key] = 'asc';
        }
    });
    
    // Sort rows
    dataRows.sort((a, b) => {
        let aValue, bValue;
        
        if (columnIndex === 0) {
            // ID - sort as number
            aValue = parseInt(a.cells[columnIndex].textContent);
            bValue = parseInt(b.cells[columnIndex].textContent);
        } else if (columnIndex === 3) {
            // Harga - hapus "Rp" dan titik, convert ke number
            aValue = parseInt(a.cells[columnIndex].textContent.replace(/[Rp.\s]/g, ''));
            bValue = parseInt(b.cells[columnIndex].textContent.replace(/[Rp.\s]/g, ''));
        } else if (columnIndex === 4) {
            // Stok - sort as number
            aValue = parseInt(a.cells[columnIndex].textContent);
            bValue = parseInt(b.cells[columnIndex].textContent);
        }
        
        if (newDirection === 'asc') {
            return aValue - bValue;
        } else {
            return bValue - aValue;
        }
    });
    
    // Re-append sorted rows
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
                const nameCell = rows[i].getElementsByTagName('td')[2]; // Kolom nama snack
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
});
