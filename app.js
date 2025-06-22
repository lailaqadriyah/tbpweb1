// Import necessary modules and dependencies
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');

const port = 3000;

// Database and Models
const sequelize = require('./config/db');
require('./models/Relation'); // Memuat semua definisi relasi

// Inisialisasi aplikasi Express
var app = express();

// VIEW ENGINE SETUP
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// GLOBAL MIDDLEWARE
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// KONFIGURASI EXPRESS-SESSION
app.use(session({
    secret: 'iniadalahkuncirahasiayangkuatsekaliuntuksessiapplikasikamu',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// KONFIGURASI CONNECT-FLASH
app.use(flash());

// MIDDLEWARE UNTUK PESAN FLASH
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.info_msg = req.flash('info');
    next();
});

// IMPORT ROUTER
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const asetRouter = require("./routes/Aset");
const peminjamanBarangRouter = require("./routes/PeminjamanBarang");
const pengembalianBarangRouter = require("./routes/PengembalianBarang");
const laporanRouter = require("./routes/Laporan");
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const ruanganRouter = require('./routes/Ruangan');
const aslabRouter = require('./routes/Aslab'); // Router Aslab yang sudah digabung
const kalenderRouter = require('./routes/kalenderAktivitas'); // PERBAIKAN: Menggunakan nama file yang benar (case-sensitive)

// GUNAKAN ROUTER
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/", asetRouter);
app.use('/', peminjamanBarangRouter);
app.use("/", pengembalianBarangRouter);
app.use("/", laporanRouter);
app.use("/", loginRouter);
app.use("/", logoutRouter);
app.use("/", ruanganRouter);
app.use('/aslab', aslabRouter); // Semua rute /aslab ditangani di sini
app.use('/kalender-aktivitas', kalenderRouter); // PERBAIKAN: Memberikan mount-point yang benar
app.use('/notifikasi', pengembalianBarangRouter);

// CATCH 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// ERROR HANDLER
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// FUNGSI UNTUK MEMULAI SERVER SETELAH KONEKSI DB BERHASIL
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Koneksi database berhasil.');

        await sequelize.sync({ alter: true });
        console.log('Semua tabel model berhasil disinkronkan ke database!');

        app.listen(port, () => {
            console.log(`Server berjalan di http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Gagal memulai server atau sinkronisasi database:', error);
        process.exit(1);
    }
}

// Panggil fungsi untuk memulai server
startServer();

module.exports = app;