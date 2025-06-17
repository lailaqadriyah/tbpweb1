const session = require('express-session');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const port = 3000;

var app = express();

const sequelize = require('./config/db');
const { Aset } = require('./models/AsetModel');
const { PengembalianBarang } = require('./models/PengembalianBarangModel');
const { PeminjamanBarang } = require('./models/PeminjamanBarangModel'); // Import model PeminjamanBarang
const { Asisten } = require('./models/Asistenmodel');
const { Ruangan } = require('./models/RuanganModel');

const asetRouter = require("./routes/Aset");
const pengembalianBarangRouter = require("./routes/PengembalianBarang");
const laporanRouter = require("./routes/Laporan");
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const addBarangRouter = require('./routes/Aset');
const ruanganRouter= require('./routes/Ruangan');
const tambahRuangan = require('./routes/Ruangan');
const updateRuangan = require('./routes/Ruangan');
const detailRuangan = require('./routes/Ruangan');

// ✅ Tambahan dari remote
const addAslabRoutes = require('./routes/AddAslab');
const dataAsistenRoute = require('./routes/dataasisten');

// ✅ Tambahan dari lokal (perhatikan: ini adalah duplikasi dari pengembalianBarangRouter)
const notifikasiRouter = require("./routes/PengembalianBarang");


// --- KODE Nodemailer yang Ditambahkan ---
const nodemailer = require("nodemailer");

async function kirimEMail() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "lailaqdr04@gmail.com",
        pass: "wqxmyrtqdfswqibd", // PERHATIAN: Password langsung di kode sangat tidak disarankan untuk produksi! Gunakan variabel lingkungan.
      },
    });

    const info = await transporter.sendMail({
      from: "noreply", // Ganti dengan email pengirim yang valid jika memungkinkan
      to: "lailaqdr10@gmail.com",
      subject: "Mengirim EMail",
      text: "mengirim email itu mudah",
    });

    console.log("Email berhasil dikirim: %s", info.messageId);
    return true; // Menandakan pengiriman email berhasil
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return false; // Menandakan pengiriman email gagal
  }
}
// --- AKHIR KODE Nodemailer yang Ditambahkan ---


// Fungsi untuk memulai server setelah koneksi DB berhasil
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Koneksi database berhasil.');

        // Sinkronkan semua model yang didefinisikan (termasuk Aset, PengembalianBarang, PeminjamanBarang)
        // Gunakan { alter: true } untuk mengubah tabel yang ada agar sesuai dengan model
        // Hati-hati dengan ini di lingkungan produksi!
        await sequelize.sync({ alter: true });
        console.log('Semua tabel model berhasil disinkronkan ke database!');

        // View engine setup
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'ejs');

       
        app.use(logger('dev'));
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public')));

        // Menambahkan fungsi kirimEMail ke `req` agar bisa diakses di route handlers
        app.use((req, res, next) => {
          req.kirimEMail = kirimEMail;
          next();
        });

        // Gunakan semua router
        // Pastikan urutan router Anda sesuai dengan kebutuhan aplikasi.
        // Jika ada konflik rute, yang didefinisikan duluan akan diproses.
        app.use("/", asetRouter);
        app.use("/", pengembalianBarangRouter);
        app.use("/", laporanRouter);
        app.use("/", loginRouter);
        app.use("/", logoutRouter);
        // Perhatikan: notifikasiRouter adalah duplikasi dari pengembalianBarangRouter.
        // Jika rute-nya sama, ini bisa menyebabkan masalah atau hanya redundansi.
        // Saya tetap mempertahankan sesuai input Anda, tapi perlu dipertimbangkan.
        app.use("/", notifikasiRouter);
        app.use("/", addBarangRouter);
        
        app.use("/", ruanganRouter);
        app.use("/", tambahRuangan);
        app.use("/", updateRuangan);
        app.use("/", detailRuangan);

        // Router baru dari remote
        app.use('/aslab', addAslabRoutes);
        app.use('/', dataAsistenRoute); // Jika ada rute dasar '/', pastikan tidak konflik dengan indexRouter.


        var indexRouter = require('./routes/index');
        var usersRouter = require('./routes/users');

        // Rute dasar, jika sudah ada di indexRouter, ini bisa dihapus atau diubah.
        app.get("/", (req, res) => {
            res.send("Halo! Ini server pertama saya dengan Express.js");
        });

        app.use('/', indexRouter);
        app.use('/users', usersRouter);

        app.get("/index", (req, res) => {
            res.render("index", { title: "Halaman Utama" });
        });

        // Contoh bagaimana memanggil kirimEMail dari route (misalnya setelah pengembalian berhasil)
        // Ini hanya contoh, Anda perlu mengintegrasikannya ke logika bisnis Anda di dalam router yang relevan.
        // Contoh: Di dalam routes/PengembalianBarang.js
        app.post('/api/pengembalian-berhasil', async (req, res) => {
            // ... logika untuk memproses pengembalian barang ...

            const emailSent = await req.kirimEMail(); // Panggil fungsi pengiriman email melalui req
            if (emailSent) {
                console.log("Email notifikasi pengembalian berhasil dikirim.");
            } else {
                console.log("Gagal mengirim email notifikasi pengembalian.");
            }
            res.status(200).send("Pengembalian berhasil diproses.");
        });


        // Catch 404 and forward to error handler
        app.use(function(req, res, next) {
            next(createError(404));
        });

        // Error handler
        app.use(function(err, req, res, next) {
            res.locals.message = err.message;
            res.locals.error = req.app.get('env') === 'development' ? err : {};
            res.status(err.status || 500);
            res.render('error');
        });

        app.listen(port, () => {
            console.log(`Server berjalan di http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Gagal memulai server atau sinkronisasi database:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;