 const { Aset } = require('../models/AsetModel'); 

        // RUTE UTAMA UNTUK MENAMPILKAN DAFTAR ASET DENGAN DATA DARI DATABASE

        // ==============================================================================
        app.get("/aset", async (req, res) => {
            try {
                // Ambil semua data aset dari database menggunakan model Sequelize
                const allAset = await Aset.findAll({
                    order: [['id', 'ASC']] // Contoh pengurutan, Anda bisa ubah sesuai kebutuhan
                });

                // Render tampilan 'Aset.ejs' dan kirim data aset ke dalamnya
                res.render("Aset", {
                    title: "Daftar Aset",
                    // Penting: Konversi instance Sequelize ke plain JSON object sebelum dikirim ke EJS
                    asets: allAset.map(aset => aset.toJSON()) 
                });
            } catch (error) {
                console.error('Gagal mengambil data aset:', error);
                res.status(500).send('Terjadi kesalahan saat memuat data aset.');
            }
        });

        // ==============================================================================
        // RUTE UNTUK UPDATE BARANG (menampilkan form dengan data aset yang akan diupdate)
        // ==============================================================================
        app.get("/updatebarang/:id", async (req, res) => {
            try {
                const asetId = req.params.id;
                // Cari aset berdasarkan primary key (ID)
                const asetToUpdate = await Aset.findByPk(asetId); 

                if (asetToUpdate) {
                    // Render tampilan 'UpdateBarang.ejs' dan kirim data aset ke dalamnya
                    res.render("Update Barang", {
                        title: "Update Barang",
                        id: asetId, // Mengirim ID untuk digunakan di form EJS
                        aset: asetToUpdate.toJSON() // Mengirim data aset yang akan diupdate
                    });
                } else {
                    res.status(404).send('Aset tidak ditemukan untuk diupdate.');
                }
            } catch (error) {
                console.error('Error saat mengambil data aset untuk update:', error);
                res.status(500).send('Gagal memuat form update aset.');
            }
        });

        // ==============================================================================
        // RUTE API UNTUK MENGHAPUS ASET (Dipanggil oleh JavaScript di frontend)
        // ==============================================================================
        app.delete('/api/aset/:id', async (req, res) => {
            try {
                const asetId = req.params.id; // Ambil ID dari parameter URL
                // Hapus aset dari database berdasarkan ID
                const deletedRows = await Aset.destroy({
                    where: { id: asetId } 
                });

                if (deletedRows > 0) {
                    res.status(200).json({ message: 'Aset berhasil dihapus.' });
                } else {
                    res.status(404).json({ error: 'Aset tidak ditemukan.' });
                }
            } catch (error) {
                console.error('Error menghapus aset:', error);
                res.status(500).json({ error: 'Gagal menghapus aset.', details: error.message });
            }
        });
        // ==============================================================================

       