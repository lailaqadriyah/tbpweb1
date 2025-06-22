// ========== FILE: controllers/Laporan.js ==========
const { Aset } = require("../models/AsetModel");
const { PengembalianBarang } = require("../models/PengembalianBarangModel");
const { stringify } = require("csv-stringify");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const puppeteer = require("puppeteer");
const path = require("path");
const ejs = require("ejs");

// ===============================
// TAMPIL DATA BARANG RUSAK
// ===============================
const tampilBarangRusak = async (req, res) => {
  try {
    const asetRusak = await Aset.findAll({
      where: { kondisi: 'Rusak' },
      order: [['tanggal_masuk', 'DESC']]
    });
    res.render('ExportBarangRusak', {
      title: 'Export Barang Rusak',
      aset: asetRusak
    });
  } catch (error) {
    console.error('Gagal mengambil data barang rusak:', error);
    res.status(500).send('Gagal memuat laporan barang rusak.');
  }
};

// ===============================
// EXPORT BARANG RUSAK
// ===============================
const exportBarangRusak = async (req, res) => {
  const format = req.body.format;

  try {
    const rusak = await Aset.findAll({ where: { kondisi: 'Rusak' } });

    if (format === 'csv') {
      const data = rusak.map(item => ({
        'Kode Barang': item.kode_barang,
        'Nama Barang': item.nama_barang,
        'Kuantitas': item.kuantitas,
        'Kategori': item.kategori_barang,
        'Lokasi': item.lokasi,
        'Tanggal Masuk': new Date(item.tanggal_masuk).toLocaleDateString('id-ID'),
        'Kondisi': item.kondisi
      }));
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=barang_rusak.csv');
      stringify(data, { header: true }).pipe(res);
    }

    else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Barang Rusak");
      worksheet.columns = [
        { header: 'Kode Barang', key: 'kode_barang', width: 20 },
        { header: 'Nama Barang', key: 'nama_barang', width: 25 },
        { header: 'Kuantitas', key: 'kuantitas', width: 10 },
        { header: 'Kategori', key: 'kategori_barang', width: 20 },
        { header: 'Lokasi', key: 'lokasi', width: 20 },
        { header: 'Tanggal Masuk', key: 'tanggal_masuk', width: 20 },
        { header: 'Kondisi', key: 'kondisi', width: 15 }
      ];
      rusak.forEach(item => {
        worksheet.addRow({
          kode_barang: item.kode_barang,
          nama_barang: item.nama_barang,
          kuantitas: item.kuantitas,
          kategori_barang: item.kategori_barang,
          lokasi: item.lokasi,
          tanggal_masuk: new Date(item.tanggal_masuk).toLocaleDateString('id-ID'),
          kondisi: item.kondisi
        });
      });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=barang_rusak.xlsx");
      await workbook.xlsx.write(res);
      res.end();
    }

    else if (format === 'pdf') {
      const html = await ejs.renderFile(
        path.join(__dirname, '../views/ExportBarangRusakPDF.ejs'),
        { aset: rusak }
      );
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', bottom: '20mm' }
      });
      await browser.close();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=barang_rusak.pdf');
      res.end(pdfBuffer);
    }

  } catch (error) {
    console.error('Gagal mengekspor barang rusak:', error);
    res.status(500).send('Gagal mengekspor barang rusak.');
  }
};

const getLaporanDikembalikan = async (req, res) => {
  try {
    const data = await PengembalianBarang.findAll({ where: { status_pengembalian: "Sudah Dikembalikan" }, order: [["tanggal_kembali", "DESC"]] });
    res.render("ExportPengembalian", { laporanPengembalian: data });
  } catch (error) {
    console.error("Gagal mengambil data pengembalian:", error);
    res.status(500).send("Gagal memuat laporan pengembalian.");
  }
};

const exportLaporanPengembalian = async (req, res) => {
  try {
    const format = req.body.format;
    const data = await PengembalianBarang.findAll({ where: { status_pengembalian: "Sudah Dikembalikan" }, raw: true });
    const formatted = data.map(item => ({
      "Kode Barang": item.kode_barang,
      "Nama Barang": item.nama_barang,
      "Nama Peminjam": item.nama_peminjam,
      "Email": item.email,
      "No HP": item.no_hp,
      "Tanggal Pinjam": new Date(item.tanggal_pinjam).toLocaleDateString("id-ID"),
      "Tanggal Kembali": new Date(item.tanggal_kembali).toLocaleDateString("id-ID"),
      "Kondisi": item.kondisi
    }));

    const filename = `laporan_pengembalian_${Date.now()}`;

    if (format === 'csv') {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}.csv`);
      stringify(formatted, { header: true }).pipe(res);
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Laporan Pengembalian");
      worksheet.columns = Object.keys(formatted[0]).map(key => ({ header: key, key, width: 20 }));
      formatted.forEach(row => worksheet.addRow(row));
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      res.setHeader("Content-Disposition", `attachment; filename=${filename}.pdf`);
      res.setHeader("Content-Type", "application/pdf");
      doc.pipe(res);
      doc.fontSize(16).text("Laporan Pengembalian Barang", { align: "center" }).moveDown();
      formatted.forEach(item => {
        Object.entries(item).forEach(([key, val]) => {
          doc.text(`${key}: ${val}`);
        });
        doc.moveDown();
      });
      doc.end();
    }
  } catch (error) {
    console.error("Gagal ekspor laporan pengembalian:", error);
    res.status(500).send("Gagal ekspor laporan pengembalian.");
  }
};

const getLaporanRiwayatPeminjaman = async (req, res) => {
  try {
    const data = await Aset.findAll({ order: [["tanggal_masuk", "DESC"]] });
    res.render("ExportRiwayatPeminjaman", { aset: data });
  } catch (error) {
    console.error("Gagal mengambil riwayat peminjaman:", error);
    res.status(500).send("Gagal memuat riwayat peminjaman.");
  }
};

const exportRiwayatPeminjaman = async (req, res) => {
  try {
    const format = req.body.format;
    const data = await Aset.findAll({ raw: true });
    const formatted = data.map(item => ({
      "Kode Barang": item.kode_barang,
      "Nama Barang": item.nama_barang,
      "Kategori": item.kategori_barang,
      "Lokasi": item.lokasi,
      "Tanggal Masuk": new Date(item.tanggal_masuk).toLocaleDateString("id-ID"),
      "Kondisi": item.kondisi
    }));

    const filename = `riwayat_peminjaman_${Date.now()}`;

    if (format === 'csv') {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}.csv`);
      stringify(formatted, { header: true }).pipe(res);
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Riwayat Peminjaman");
      worksheet.columns = Object.keys(formatted[0]).map(key => ({ header: key, key, width: 20 }));
      formatted.forEach(row => worksheet.addRow(row));
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } 
  } catch (error) {
    console.error("Gagal ekspor riwayat peminjaman:", error);
    res.status(500).send("Gagal ekspor riwayat peminjaman.");
  }
};

module.exports = {
  tampilBarangRusak,
  exportBarangRusak,
  getLaporanDikembalikan,
  exportLaporanPengembalian,
  getLaporanRiwayatPeminjaman,
  exportRiwayatPeminjaman
};