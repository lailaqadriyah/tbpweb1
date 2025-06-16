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
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');

// ✅ Tambahan dari remote
const addAslabRoutes = require('./routes/AddAslab');
app.use('/aslab', addAslabRoutes);
const dataAsistenRoute = require('./routes/dataasisten');
app.use('/', dataAsistenRoute);

// ✅ Tambahan dari lokal
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
            secret: 'rahasia123',
            resave: false,
            saveUninitialized: true,
            cookie: { secure: false }
        }));
        app.use(logger('dev'));
        app.use(express.json()); 
        app.use(express.urlencoded({ extended: false })); 
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public'))); 

        // Gunakan semua router
        app.use("/", asetRouter, pengembalianBarangRouter, laporanRouter, loginRouter, logoutRouter, notifikasiRouter);

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
