 const { Aset } = require('../models/AsetModel'); 

        // RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE

        // ==============================================================================
       const getAllAset = async (req, res) => {
        try {
            const allAset = await Aset.findAll({
                order: [['id', 'ASC']] // Mengurutkan berdasarkan ID secara menurun
            });

            res.render("Aset", {
                title: "Daftar Aset",
                aset: allAset 
            });
        } catch (error) {
            console.error('Error saat mengambil data aset:', error);
            res.status(500).send('Gagal memuat daftar aset.');
        }
       };

      const getAsetForUpdate = async (req, res) => {
    try {
        const asetId = req.params.id; // Ambil ID aset dari parameter URL
        
        // Cari aset berdasarkan primary key (ID) di database
        const asetToUpdate = await Aset.findByPk(asetId); 

        // Jika aset ditemukan
        if (asetToUpdate) {
            // Render tampilan 'Update Barang.ejs'
            // Kirim data aset 
            res.render("UpdateBarang", {
                title: "Update Barang", // Judul halaman
                id: asetId, // Mengirim ID untuk digunakan di form EJS (misal untuk action form)
                asset: asetToUpdate // Mengirim data aset yang akan diupdate
            });
        } else {
            // Jika aset tidak ditemukan, kirim respons 404 Not Found
            res.status(404).send('Aset tidak ditemukan untuk diupdate.');
        }
    } catch (error) {
        // Tangani error yang terjadi saat mengambil data aset
        console.error('Error saat mengambil data aset untuk update:', error);
        res.status(500).send('Gagal memuat form update aset. Silakan coba lagi.');
    }
};

// ==============================================================================
// CONTROLLER: updateAset (Revisi untuk redirect)
// ==============================================================================
const updateAset = async (req, res) => {
    try {
        const asetId = req.params.id; 
        const {
            kode_barang,
            nama_barang,
            kuantitas,
            tanggal_masuk,
            kondisi,
            lokasi,
            kategori_barang
        } = req.body; 

        const asetToUpdate = await Aset.findByPk(asetId);

        if (!asetToUpdate) {
            // Jika aset tidak ditemukan, arahkan kembali dengan pesan error (opsional, bisa juga render halaman error)
            return res.status(404).redirect('/aset?status=error&message=Aset tidak ditemukan untuk diupdate.');
        }

        await asetToUpdate.update({
            kode_barang,
            nama_barang,
            kuantitas,
            tanggal_masuk,
            kondisi,
            lokasi,
            kategori_barang
        });

        // Arahkan kembali ke halaman daftar aset setelah sukses
        // Anda bisa menambahkan query param untuk pesan sukses jika mau
        res.redirect('/aset?status=success&message=Aset berhasil diperbarui!'); 

    } catch (error) {
        console.error('Error saat memperbarui aset:', error);
        // Arahkan kembali dengan pesan error
        res.status(500).redirect('/aset?status=error&message=Gagal memperbarui aset. Silakan coba lagi.');
    }
};

// ==============================================================================
// CONTROLLER: deleteAset (Revisi untuk API/AJAX dengan JSON response)
// ==============================================================================
const deleteAset = async (req, res) => {
    try {
        const asetId = req.params.id; 
        
        const deletedRows = await Aset.destroy({
            where: { id: asetId } 
        });

        if (deletedRows > 0) {
            // Kirim respons JSON sukses untuk AJAX (sesuai dengan SweetAlert2 fetch Anda)
            res.status(200).json({ message: 'Aset berhasil dihapus.' });
        } else {
            // Kirim respons JSON 404 untuk AJAX
            res.status(404).json({ error: 'Aset tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error menghapus aset:', error);
        // Kirim respons JSON 500 untuk AJAX
        res.status(500).json({ 
            error: 'Gagal menghapus aset.', 
            details: error.message 
        });
    }
};

// ==============================================================================
// FUNGSI BARU: getAssetDetail - Menggunakan Sequelize (konsisten)
// ==============================================================================
const getAsetDetail = async (req, res) => {
    const asetId = req.params.id; // Mengambil ID dari parameter URL

    try {
        // Menggunakan Sequelize findByPk (Find by Primary Key)
        // Ini adalah cara paling efisien untuk mencari berdasarkan ID unik
        const asset = await Aset.findByPk(asetId);

        if (asset) {
            // Jika aset ditemukan, render template EJS
            res.render('DetailBarang', { // Pastikan path ini benar (misal: views/pages/assetDetail.ejs)
                title: 'Detail Barang',
                asset: asset.toJSON() // Mengubah instance Sequelize menjadi objek JSON biasa
                                      // Ini berguna jika Anda perlu mengakses properti data secara langsung
                                      // dan bukan metode instance Sequelize.
                                      // Namun, jika Anda hanya mengakses asset.nama_barang dll, asset langsung juga bisa.
            });
        } else {
            // Jika barang tidak ditemukan
            res.status(404).render('pages/404', { title: 'Tidak Ditemukan', message: 'Barang tidak ditemukan.' });
        }
    } catch (error) {
        console.error('Error fetching asset detail:', error);
        // Mengirimkan halaman error atau pesan error
        res.status(500).render('pages/error', { title: 'Error Server', message: 'Terjadi kesalahan saat mengambil detail barang.' });
    }
};

// Ekspor semua fungsi controller
module.exports = {
    getAllAset,
    getAsetForUpdate,
    updateAset,
    deleteAset,
    getAsetDetail // Pastikan nama fungsinya di sini sama dengan nama const di atas
};