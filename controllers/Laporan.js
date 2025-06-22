// ========== FILE: controllers/Laporan.js ==========
const { Aset } = require("../models/AsetModel");
const { PengembalianBarang } = require("../models/PengembalianBarangModel");
const { stringify } = require("csv-stringify");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const puppeteer = require("puppeteer");
const path = require("path");
const ejs = require("ejs");

const tampilBarangRusak = async (req, res) => {
  try {
    const asetRusak = await Aset.findAll({
      where: { kondisi: 'Rusak' },
      order: [['tanggal_masuk', 'DESC']]
    });
    res.render('ExportBarangRusak', { title: 'Export Barang Rusak', aset: asetRusak });
  } catch (error) {
    console.error('Gagal mengambil data barang rusak:', error);
    res.status(500).send('Gagal memuat laporan barang rusak.');
  }
};

const exportBarangRusak = async (req, res) => {
  const format = req.body.format;
  try {
    const rusak = await Aset.findAll({ where: { kondisi: 'Rusak' } });
    const data = rusak.map(item => ({
      'Kode Barang': item.kode_barang,
      'Nama Barang': item.nama_barang,
      'Kuantitas': item.kuantitas,
      'Kategori': item.kategori_barang,
      'Lokasi': item.lokasi,
      'Tanggal Masuk': new Date(item.tanggal_masuk).toLocaleDateString('id-ID'),
      'Kondisi': item.kondisi
    }));

    const filename = `barang_rusak_${Date.now()}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
      stringify(data, { header: true }).pipe(res);
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Barang Rusak");
      worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key, width: 20 }));
      data.forEach(row => worksheet.addRow(row));
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}.xlsx`);
      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      const html = await ejs.renderFile(path.join(__dirname, '../views/ExportBarangRusakPDF.ejs'), { aset: rusak });
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
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