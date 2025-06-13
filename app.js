var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const port = 3000;

var app = express();

const sequelize = require('./config/db');
const { Aset } = require('./models/AsetModel'); 

// Fungsi untuk memulai server setelah koneksi DB berhasil
async function startServer() {
    try {
        await sequelize.authenticate(); 
        console.log('Koneksi database berhasil.');

        await sequelize.sync(); 
        console.log('Tabel Aset berhasil disinkronkan ke database!');

        // View engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'ejs');

        app.use(logger('dev'));
        app.use(express.json()); 
        app.use(express.urlencoded({ extended: false })); 
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public'))); 

        var indexRouter = require('./routes/index');
        var usersRouter = require('./routes/users');

        app.get("/", (req, res) => {
            res.send("Halo! Ini server pertama saya dengan Express.js");
        });

        app.use('/', indexRouter); 
        app.use('/users', usersRouter);

        app.get("/index", (req, res) => {
            res.render("index", { title: "Halaman Utama" });
        });

        app.get("/pengembalian", (req, res) => {
            res.render("PengembalianBarang", { title: "Pengembalian Barang" });
        });

        // ==============================================================================
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
                    res.render("UpdateBarang", {
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

        // Catch 404 and forward to error handler
        app.use(function(req, res, next) {
            next(createError(404));
        });

        // Error handler
        app.use(function(err, req, res, next) {
            // Set locals, only providing error in development
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};

            // Render the error page
            res.status(err.status || 500);
            res.render('error');
        });

        // Mulai server HANYA setelah koneksi database dan sinkronisasi selesai
        app.listen(port, () => {
            console.log(`Server berjalan di http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Gagal memulai server atau sinkronisasi database:', error);
        // Keluar dari proses jika ada error fatal pada startup
        process.exit(1); 
    }
}

// Panggil fungsi utama untuk memulai server dan sinkronisasi DB
startServer();

module.exports = app;