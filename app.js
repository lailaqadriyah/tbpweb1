var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const port = 3000;

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route handlers
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Main routes
app.get("/", (req, res) => {
  res.send("Halo! Ini server pertama saya dengan Express.js");
});

app.use('/', indexRouter); // This also likely handles the root route
app.use('/users', usersRouter);

app.get("/index", (req, res) => {
  res.render("index", { title: "Halaman Utama" });
});

app.get("/pengembalian", (req, res) => {
  res.render("PengembalianBarang", { title: "Pengembalian Barang" });
});

app.get("/aset", (req, res) => {
  res.render("Aset", { title: "Aset" });
});

// >>> TEMPATKAN RUTE BARU ANDA DI SINI <<<
app.get("/updatebarang/:id", (req, res) => {
  const id = req.params.id;
  res.render("UpdateBarang", { title: "Update Barang", id: id });
});
// <<< AKHIR RUTE BARU >>>

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

// Start the server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

module.exports = app;