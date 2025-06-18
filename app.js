// Import necessary modules and dependencies
const session = require('express-session');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const port = 3000;

var app = express();

// Database and Models
const sequelize = require('./config/db');
const { Aset } = require('./models/AsetModel');
const { PengembalianBarang } = require('./models/PengembalianBarangModel');
const { PeminjamanBarang } = require('./models/PeminjamanBarangModel'); 
const { Asisten } = require('./models/Asistenmodel');
const { Ruangan } = require('./models/RuanganModel');

// Import Router
const asetRouter = require("./routes/Aset");
const peminjamanBarangRouter = require("./routes/PeminjamanBarang");
const pengembalianBarangRouter = require("./routes/PengembalianBarang");
const laporanRouter = require("./routes/Laporan");
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const addBarangRouter = require('./routes/Aset');
const ruanganRouter = require('./routes/Ruangan');
const tambahRuangan = require('./routes/Ruangan');
const updateRuangan = require('./routes/Ruangan');
const detailRuangan = require('./routes/Ruangan');

// ✅ Import router files for the views
const addAslabRoutes = require('./routes/AddAslab');
const dataAsistenRoute = require('./routes/dataasisten');

// Menambahkan rute untuk '/aslab/tambah' dan '/aslab/data'
app.use('/aslab', addAslabRoutes);  // Menangani '/aslab/tambah'
app.use('/aslab', dataAsistenRoute);  // Menangani '/aslab/data'

// **Import notifikasiRouter**
const notifikasiRouter = require("./routes/PengembalianBarang");  // Mengimpor notifikasiRouter

// Gunakan router untuk pengembalian barang / notifikasi
app.use("/notifikasi", notifikasiRouter);  // Menambahkan rute '/notifikasi' untuk pengembalian barang

// Router lainnya
app.use("/", asetRouter);
app.use('/', peminjamanBarangRouter);
app.use("/", pengembalianBarangRouter);
app.use("/", laporanRouter);
app.use("/", loginRouter);
app.use("/", logoutRouter);
app.use("/", addBarangRouter);
app.use("/", ruanganRouter);
app.use("/", tambahRuangan);
app.use("/", updateRuangan);
app.use("/", detailRuangan);

// Rute lainnya
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Defining a route for the home page
app.get("/", (req, res) => {
    res.send("Halo! Ini server pertama saya dengan Express.js");
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Route for the 'index' page
app.get("/index", (req, res) => {
    res.render("index", { title: "Halaman Utama" });
});

// Nodemailer for sending email (customize with environment variables for production)
const nodemailer = require("nodemailer");

async function kirimEMail() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "lailaqdr04@gmail.com",
        pass: "wqxmyrtqdfswqibd", // IMPORTANT: Don't store password directly in code for production!
      },
    });

    const info = await transporter.sendMail({
      from: "noreply", // Replace with a valid sender email
      to: "lailaqdr10@gmail.com",
      subject: "Mengirim EMail",
      text: "mengirim email itu mudah",
    });

    console.log("Email berhasil dikirim: %s", info.messageId);
    return true; // Success
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    return false; // Failure
  }
}

// Function to start the server after DB connection is successful
async function startServer() {
    try {
        // Connect to DB
        await sequelize.authenticate();
        console.log('Koneksi database berhasil.');

        // Sync models with DB (use { alter: true } for production cautiously)
        await sequelize.sync({ alter: true });
        console.log('Semua tabel model berhasil disinkronkan ke database!');

        // Set view engine
        app.set('views', path.join(__dirname, 'views'));
        app.set('view engine', 'ejs');

        app.use(logger('dev'));
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use(cookieParser());
        app.use(express.static(path.join(__dirname, 'public')));

        // Add function to send email to req (accessible in route handlers)
        app.use((req, res, next) => {
          req.kirimEMail = kirimEMail;
          next();
        });

        // Use all routers
        app.use("/", asetRouter);
        app.use("/", pengembalianBarangRouter);
        app.use("/", laporanRouter);
        app.use("/", loginRouter);
        app.use("/", logoutRouter);
        app.use("/", addBarangRouter);
        app.use("/", ruanganRouter);
        app.use("/", tambahRuangan);
        app.use("/", updateRuangan);
        app.use("/", detailRuangan);

        // Route for Add Aslab and Data Asisten
        app.use('/aslab', addAslabRoutes);
        app.use('/', dataAsistenRoute);

        // Other routes
        var indexRouter = require('./routes/index');
        var usersRouter = require('./routes/users');

        app.use('/', indexRouter);
        app.use('/users', usersRouter);

        app.get("/index", (req, res) => {
            res.render("index", { title: "Halaman Utama" });
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server berjalan di http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Gagal memulai server atau sinkronisasi database:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
