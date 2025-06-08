const express = require("express");
const path = require("path"); 
const app = express();
const port = 3000;

app.set('view engine', 'ejs'); 
app.set('views', './views'); 

app.use(express.static(path.join(__dirname, 'public'))); 

app.get("/", (req, res) => {
  res.send("Halo! Ini server pertama saya dengan Express.js");
});

app.get("/index", (req, res) => {
  res.render("index", { title: "Halaman Utama" });
});

app.get("/pengembalian", (req, res) => {
  res.render("PengembalianBarang", { title: "Pengembalian Barang" });
});

app.get("/aset", (req, res) => {
  res.render("Aset", { title: "Aset" });
});


app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
