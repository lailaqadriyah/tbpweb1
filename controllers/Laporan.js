const { Aset } = require('../models/AsetModel'); 

const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

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

const exportBarangRusak = async (req, res) => {
  const format = req.body.format;

  try {
    const rusak = await Aset.findAll({ where: { kondisi: 'Rusak' } });

    if (format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(rusak.map(r => r.toJSON()));
      res.header('Content-Type', 'text/csv');
      res.attachment('laporan-barang-rusak.csv');
      return res.send(csv);
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Barang Rusak');

      worksheet.columns = [
        { header: 'Kode Barang', key: 'kode_barang', width: 20 },
        { header: 'Nama Barang', key: 'nama_barang', width: 30 },
        { header: 'Kuantitas', key: 'kuantitas', width: 10 },
        { header: 'Kategori', key: 'kategori_barang', width: 20 },
        { header: 'Lokasi', key: 'lokasi', width: 20 },
        { header: 'Tanggal Masuk', key: 'tanggal_masuk', width: 20 },
        { header: 'Kondisi', key: 'kondisi', width: 10 },
      ];

      rusak.forEach(data => {
        worksheet.addRow(data.toJSON());
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=laporan-barang-rusak.xlsx');

      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    if (format === 'pdf') {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Disposition', 'attachment; filename=laporan-barang-rusak.pdf');
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  // Judul
  doc.fontSize(16).font('Helvetica-Bold').text('Laporan Barang Rusak', { align: 'center' });
  doc.moveDown(1.5);

  // Header tabel
  const headers = [
    'No', 'Kode Barang', 'Nama Barang', 'Jumlah', 'Kategori', 'Lokasi', 'Tgl Masuk', 'Kondisi'
  ];
  const colWidths = [30, 80, 100, 50, 80, 80, 70, 60];
  let y = doc.y;

  // Header background
  doc.fontSize(10).font('Helvetica-Bold');
  let x = doc.page.margins.left;
  headers.forEach((header, i) => {
    doc.text(header, x, y, { width: colWidths[i], align: 'left' });
    x += colWidths[i];
  });

  // Garis bawah header
  doc.moveTo(doc.page.margins.left, y + 15)
     .lineTo(doc.page.width - doc.page.margins.right, y + 15)
     .stroke();

  // Isi data
  doc.font('Helvetica').fontSize(9);
  let rowY = y + 20;
  rusak.forEach((item, index) => {
    const values = [
      index + 1,
      item.kode_barang,
      item.nama_barang,
      item.kuantitas,
      item.kategori_barang,
      item.lokasi,
      new Date(item.tanggal_masuk).toLocaleDateString('id-ID'),
      item.kondisi
    ];
    let rowX = doc.page.margins.left;
    values.forEach((val, i) => {
      doc.text(String(val), rowX, rowY, { width: colWidths[i], align: 'left' });
      rowX += colWidths[i];
    });
    rowY += 18;

    // Tambahkan garis bawah setiap baris
    doc.moveTo(doc.page.margins.left, rowY - 3)
       .lineTo(doc.page.width - doc.page.margins.right, rowY - 3)
       .stroke();
  });

  doc.end();
  return;
}



  } catch (error) {
    console.error('Gagal mengekspor data:', error);
    res.status(500).send('Gagal mengekspor data.');
  }
};

const tampilDashboard = async (req, res) => {
  try {
    const barangRusak = await Aset.findAll({
      where: { kondisi: 'Rusak' }
    });

    res.render('Laporan', { barangRusak }); // sesuaikan dengan nama file view-nya
  } catch (error) {
    console.error('Gagal mengambil data barang rusak:', error);
    res.status(500).send('Gagal memuat dashboard');
  }
};


module.exports = {
  tampilBarangRusak,
  exportBarangRusak,
  tampilDashboard   
};
