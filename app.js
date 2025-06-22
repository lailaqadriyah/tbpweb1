// Import necessary modules and dependencies
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session'); // <-- PENTING: Untuk session
const flash = require('connect-flash');     // <-- PENTING: Untuk req.flash()

const port = 3000;

// Database and Models (Pastikan ini di-require agar model dan relasi terdefinisi)
const sequelize = require('./config/db');
require('./models/Relation'); // <-- Memuat semua definisi relasi
const { Aset } = require('./models/AsetModel'); // Diimpor untuk memastikan model dikenal oleh Sequelize
const { PengembalianBarang } = require('./models/PengembalianBarangModel');
const { PeminjamanBarang } = require('./models/PeminjamanBarangModel');
const { Asisten } = require('./models/Asistenmodel');
const { Ruangan } = require('./models/RuanganModel');


var app = express(); // Inisialisasi aplikasi Express

// VIEW ENGINE SETUP
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// GLOBAL MIDDLEWARE
app.use(logger('dev'));
app.use(express.json()); // Untuk parsing application/json
app.use(express.urlencoded({ extended: true })); // Untuk parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// KONFIGURASI EXPRESS-SESSION (HARUS SEBELUM connect-flash)
app.use(session({
    secret: 'iniadalahkuncirahasiayangkuatsekaliuntuksessiapplikasikamu', // GANTI DENGAN STRING YANG LEBIH KOMPLEKS DAN SULIT DITEBAK!
    resave: false, // Jangan menyimpan sesi jika tidak ada perubahan
    saveUninitialized: false, // Jangan membuat sesi baru untuk permintaan yang tidak diinisialisasi
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // Contoh: sesi berlaku 24 jam
}));

// KONFIGURASI CONNECT-FLASH (HARUS SETELAH express-session)
app.use(flash());

// MIDDLEWARE UNTUK MEMBUAT PESAN FLASH TERSEDIA DI SEMUA TEMPLATE EJS
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.info_msg = req.flash('info'); // Jika Anda punya pesan info
    next();
});

// IMPORT DAN GUNAKAN ROUTER
const asetRouter = require("./routes/Aset");
const peminjamanBarangRouter = require("./routes/PeminjamanBarang");
const pengembalianBarangRouter = require("./routes/PengembalianBarang"); // ini juga notifikasi router?
const laporanRouter = require("./routes/Laporan");
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const ruanganRouter = require('./routes/Ruangan');
const addAslabRoutes = require('./routes/AddAslab');
const dataAsistenRoute = require('./routes/dataasisten');


app.use("/", asetRouter); // Menangani semua rute yang dimulai dengan / dari Aset.js
app.use('/', peminjamanBarangRouter);
app.use("/", pengembalianBarangRouter);
app.use("/", laporanRouter);
app.use("/", loginRouter);
app.use("/", logoutRouter);
app.use("/", ruanganRouter); // Menangani semua rute ruangan

app.use('/aslab', addAslabRoutes);    // Menangani '/aslab/tambah'
app.use('/aslab', dataAsistenRoute);  // Menangani '/aslab/data' dan '/aslab/update/:id' (prefix /aslab)


// Rute-rute default dari Express generator (jika masih digunakan)
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
app.use('/', indexRouter);
app.use('/users', usersRouter);


app.get("/index", (req, res) => {
    res.render("index", { title: "Halaman Utama" });
});


// FUNGSI UNTUK MEMULAI SERVER SETELAH KONEKSI DB BERHASIL
async function startServer() {
    try {
        // Connect to DB
        await sequelize.authenticate();
        console.log('Koneksi database berhasil.');

        // Sync models with DB (use { alter: true } for production cautiously)
        await sequelize.sync({ alter: true }); // <-- Hati-hati dengan {alter: true} di produksi!
        console.log('Semua tabel model berhasil disinkronkan ke database!');

        // Start the server
        app.listen(port, () => {
            console.log(`Server berjalan di http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Gagal memulai server atau sinkronisasi database:', error);
        process.exit(1); // Keluar dari proses jika ada error fatal
    }
}

// Panggil fungsi untuk memulai server
startServer();

module.exports = app;