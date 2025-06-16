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
const asetRouter = require("./routes/Aset");
const pengembalianBarangRouter = require("./routes/PengembalianBarang");
const laporanRouter = require("./routes/Laporan");
const loginRouter = require('./routes/login')
const logoutRouter = require('./routes/logout');
const notifikasiRouter = require("./routes/PengembalianBarang");


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
        
        // Middleware setup 
        app.use(session({
        secret: 'rahasia123', // bebas, tapi harus rahasia
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // gunakan true jika HTTPS
}));
        app.use(logger('dev'));
        app.use(express.json()); 
        app.use(express.urlencoded({ extended: false })); 
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public'))); 
        app.use("/", asetRouter, pengembalianBarangRouter, laporanRouter, loginRouter, logoutRouter, notifikasiRouter); // Gunakan router aset dan pengembalian barang

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