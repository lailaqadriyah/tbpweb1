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
            // Kirim data aset yang ditemukan ke template dalam bentuk JSON
            res.render("UpdateBarang", {
                title: "Update Barang", // Judul halaman
                id: asetId, // Mengirim ID untuk digunakan di form EJS (misal untuk action form)
                aset: asetToUpdate // Mengirim data aset yang akan diupdate
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
// CONTROLLER: updateAset
// Fungsi untuk mengupdate aset di database
// ==============================================================================
const updateAset = async (req, res) => {
    try {
        const asetId = req.params.id; // Ambil ID aset dari parameter URL
        const {
            kode_barang,
            nama_barang, // Pastikan nama_barang juga dikirim dari form
            kuantitas,
            tanggal_masuk,
            kondisi,
            lokasi,
            kategori_barang
        } = req.body; // Ambil data yang dikirim dari form (body request)

        // Cari aset yang akan diupdate berdasarkan ID
        const asetToUpdate = await Aset.findByPk(asetId);

        if (!asetToUpdate) {
            return res.status(404).json({ error: 'Aset tidak ditemukan.' });
        }

        // Lakukan update data aset
        await asetToUpdate.update({
            kode_barang,
            nama_barang, // Update nama_barang
            kuantitas,
            tanggal_masuk,
            kondisi,
            lokasi,
            kategori_barang
            // Jika ada gambarBarang yang perlu diupdate, Anda perlu logika tambahan di sini
            // untuk menangani file upload, misal dengan 'multer'
        });

        // Kirim respons sukses
        // Anda bisa mengarahkan kembali ke daftar aset atau halaman detail aset
        res.status(200).json({ message: 'Aset berhasil diperbarui!' });
        // ATAU: res.redirect('/aset'); // Redirect ke halaman daftar aset
        // ATAU: res.redirect(`/aset/${asetId}`); // Redirect ke halaman detail aset (jika ada)

    } catch (error) {
        console.error('Error saat memperbarui aset:', error);
        res.status(500).json({
            error: 'Gagal memperbarui aset.',
            details: error.message
        });
    }
};

// ==============================================================================
// CONTROLLER: deleteAset
// Fungsi untuk menghapus aset dari database via API
// Ini biasanya dipanggil oleh JavaScript di frontend (misalnya, menggunakan fetch API)
// ==============================================================================
const deleteAset = async (req, res) => {
    try {
        const asetId = req.params.id; // Ambil ID aset dari parameter URL
        
        // Hapus aset dari database berdasarkan ID
        // Metode destroy akan mengembalikan jumlah baris yang terhapus
        const deletedRows = await Aset.destroy({
            where: { id: asetId } // Kondisi untuk menghapus aset dengan ID tertentu
        });

        // Jika ada baris yang berhasil dihapus (deletedRows > 0)
        if (deletedRows > 0) {
            // Kirim respons sukses dalam format JSON
            res.status(200).json({ message: 'Aset berhasil dihapus.' });
        } else {
            // Jika tidak ada baris yang terhapus (aset tidak ditemukan), kirim respons 404 Not Found
            res.status(404).json({ error: 'Aset tidak ditemukan.' });
        }
    } catch (error) {
        // Tangani error yang terjadi saat proses penghapusan
        console.error('Error menghapus aset:', error);
        res.status(500).json({ 
            error: 'Gagal menghapus aset.', 
            details: error.message // Berikan detail error untuk debugging
        });
    }
};

       module.exports = { getAllAset, getAsetForUpdate,
    deleteAset, updateAset }; // Ekspor fungsi-fungsi controller untuk digunakan di router