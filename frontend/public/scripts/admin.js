document.addEventListener('DOMContentLoaded', () => {
  // Pilih semua elemen barang
  const barangElements = document.querySelectorAll('.barang');

  barangElements.forEach((barang) => {
    // Ambil ID dari elemen barang
    const id = barang.dataset.id;

    // Pilih tombol di dalam elemen barang ini saja
    const tombolInput = barang.querySelectorAll('.btn');

    tombolInput.forEach((tombol) => {
      tombol.addEventListener('click', () => {
        const change = parseInt(tombol.dataset.change, 10); // Ambil nilai perubahan (+1 atau -1)
        ubahJumlah(change, id); // Panggil fungsi ubahJumlah
      });
    });
  });

  function ubahJumlah(change, id) {
    // Cari input jumlah barang berdasarkan ID
    const jumlahBarangInput = document.getElementById(`jumlahBarang-${id}`);
    let currentValue = parseInt(jumlahBarangInput.value) || 0;

    // Update nilai stok, pastikan tidak di bawah 0
    let newValue = currentValue + change;
    if (newValue < 0) {
      newValue = 0;
    }

    jumlahBarangInput.value = newValue; // Set nilai baru ke input
  }

  // Fungsi untuk menampilkan struk di modal
  const modalBody = document.querySelector('.modal-body');
  const tombolTambah = document.querySelector('[data-bs-toggle="modal"]');
  const jumlahBarangWarung = 9;
  
  tombolTambah.addEventListener('click', () => {
    tampilkanPopup();
  });

  function tentukanBarang(i) {
    const daftarBarang = {
      1: ["Momogi", 5000],
      2: ["Chocolatos", 10000],
      3: ["Nextar", 15000],
      4: ["Pizza", 20000],
      5: ["Ayam Goreng", 25000],
      6: ["Donat", 30000],
      7: ["Leminerale", 35000],
      8: ["Golda", 40000],
      9: ["Milku", 45000],
    };

    const barang = daftarBarang[i];
    if (!barang) return ["Barang Tidak Diketahui", 0];
    return barang;
  }
  
  function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
  }

  function tampilkanPopup() {
    let detail = '';
    let totalBarang = 0;

    for (let i = 1; i <= jumlahBarangWarung; i++) {
      const jumlahBarang = parseInt(document.getElementById(`jumlahBarang-${i}`).value) || 0;
      if (jumlahBarang > 0) {
        const [namaBarang, hargaBarang] = tentukanBarang(i);
        const subTotal = jumlahBarang * hargaBarang;
        detail += `${namaBarang} x ${jumlahBarang} = ${formatRupiah(subTotal)}<br>`;
        totalBarang += jumlahBarang * hargaBarang;
      }
    }

    if (detail === '') {
      detail = 'Tidak ada barang yang dipilih.';
    } else {
      detail += `<hr>Total Harga: ${formatRupiah(totalBarang)}`;
    }

    modalBody.innerHTML = detail; 
  }
});