// controllers/LaporanController.js

const { Aset } = require("../models/AsetModel");
const { PengembalianBarang } = require("../models/PengembalianBarangModel"); // Asumsi ini model untuk tabel pengembalian_barang
const { Op } = require("sequelize");

// Impor library untuk ekspor
const { stringify } = require("csv-stringify"); // Untuk CSV
const ExcelJS = require("exceljs"); // Untuk Excel
const PDFDocument = require("pdfkit"); // Untuk PDF (membutuhkan font jika ingin karakter non-standar)

// ==============================================================================
// CONTROLLER: tampilBarangRusak
// Fungsi untuk menampilkan daftar barang dengan kondisi 'Rusak'.
// ==============================================================================
const tampilBarangRusak = async (req, res) => {
  try {
    const asetRusak = await Aset.findAll({
      where: { kondisi: "Rusak" },
      order: [["tanggal_masuk", "DESC"]],
    });

    res.render("ExportBarangRusak", {
      // Nama EJS yang sesuai dengan laporan barang rusak
      title: "Laporan Barang Rusak",
      aset: asetRusak,
    });
  } catch (error) {
    console.error("Gagal mengambil data barang rusak:", error);
    res.status(500).send("Gagal memuat laporan barang rusak.");
  }
};

// ==============================================================================
// CONTROLLER: exportBarangRusak
// Fungsi untuk mengekspor data barang dengan kondisi 'Rusak' ke CSV, Excel, atau PDF.
// ==============================================================================
const exportBarangRusak = async (req, res) => {
  const format = req.body.format;

  try {
    const rusak = await Aset.findAll({
      where: { kondisi: "Rusak" },
      raw: true, // Penting untuk mendapatkan objek plain
    });

    // Definisikan headers untuk semua format export
    const headers = [
      "Kode Barang",
      "Nama Barang",
      "Kuantitas",
      "Kategori",
      "Lokasi",
      "Tanggal Masuk",
      "Kondisi",
    ];

    // Format data agar sesuai dengan header (untuk semua format)
    const formattedData = rusak.map((item) => ({
      "Kode Barang": item.kode_barang,
      "Nama Barang": item.nama_barang,
      Kuantitas: item.kuantitas,
      Kategori: item.kategori_barang,
      Lokasi: item.lokasi,
      "Tanggal Masuk": item.tanggal_masuk
        ? new Date(item.tanggal_masuk).toLocaleDateString("id-ID")
        : "",
      Kondisi: item.kondisi,
    }));

    const fileName = `laporan_barang_rusak_${new Date()
      .toISOString()
      .slice(0, 10)}`;

    switch (format) {
      case "csv":
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}.csv"`
        );
        // Gunakan stringify dengan header: true dan pastikan formattedData memiliki key yang sesuai
        stringify(formattedData, { header: true }).pipe(res);
        break;

      case "excel":
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Barang Rusak");

        // Tambahkan header
        worksheet.columns = headers.map((header) => ({
          header: header,
          key: header,
          width: 20,
        }));

        // Tambahkan data. 'addRow' di ExcelJS bisa menerima objek dengan kunci yang cocok
        formattedData.forEach((row) => {
          worksheet.addRow(row);
        });

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}.xlsx"`
        );
        await workbook.xlsx.write(res);
        res.end();
        break;

      case "pdf":
        const doc = new PDFDocument({ margin: 40 });
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}.pdf"`
        );
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        // Judul
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Laporan Barang Rusak", { align: "center" });
        doc.moveDown(1.5);

        // Header tabel
        const pdfHeadersRusak = [
          "No",
          "Kode Barang",
          "Nama Barang",
          "Kuantitas",
          "Kategori",
          "Lokasi",
          "Tgl Masuk",
          "Kondisi",
        ];
        const colWidthsRusak = [30, 70, 90, 60, 70, 70, 70, 50];
        let yRusak = doc.y;

        // Gambar header tabel
        doc.fontSize(9).font("Helvetica-Bold");
        let xRusak = doc.page.margins.left;
        pdfHeadersRusak.forEach((header, i) => {
          doc.text(header, xRusak, yRusak, {
            width: colWidthsRusak[i],
            align: "left",
            continued: true,
          });
          xRusak += colWidthsRusak[i];
        });
        doc.text(""); // Pindah baris setelah header

        // Garis bawah header
        doc
          .moveTo(doc.page.margins.left, yRusak + doc.currentLineHeight + 5)
          .lineTo(
            doc.page.width - doc.page.margins.right,
            yRusak + doc.currentLineHeight + 5
          )
          .stroke();

        // Isi data
        doc.font("Helvetica").fontSize(8);
        let rowYRusak = yRusak + doc.currentLineHeight + 10;

        formattedData.forEach((item, index) => {
          // Cek apakah halaman baru diperlukan
          if (rowYRusak + 20 > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            yRusak = doc.y;
            xRusak = doc.page.margins.left;
            doc.fontSize(9).font("Helvetica-Bold");
            pdfHeadersRusak.forEach((header, i) => {
              doc.text(header, xRusak, yRusak, {
                width: colWidthsRusak[i],
                align: "left",
                continued: true,
              });
              xRusak += colWidthsRusak[i];
            });
            doc.text("");
            doc
              .moveTo(doc.page.margins.left, yRusak + doc.currentLineHeight + 5)
              .lineTo(
                doc.page.width - doc.page.margins.right,
                yRusak + doc.currentLineHeight + 5
              )
              .stroke();
            rowYRusak = yRusak + doc.currentLineHeight + 10;
            doc.font("Helvetica").fontSize(8);
          }

          const values = [
            index + 1,
            item["Kode Barang"],
            item["Nama Barang"],
            item["Kuantitas"],
            item["Kategori"],
            item["Lokasi"],
            item["Tanggal Masuk"], // Sudah diformat di formattedData
            item["Kondisi"],
          ];
          let rowXRusak = doc.page.margins.left;
          values.forEach((val, i) => {
            doc.text(String(val), rowXRusak, rowYRusak, {
              width: colWidthsRusak[i],
              align: "left",
              continued: true,
            });
            rowXRusak += colWidthsRusak[i];
          });
          doc.text("");
          rowYRusak += doc.currentLineHeight + 5;
        });

        doc.end();
        break;

      default:
        res.status(400).send("Format export tidak valid.");
        break;
    }
  } catch (error) {
    console.error("Gagal mengekspor data barang rusak:", error);
    res.status(500).send("Gagal mengekspor data barang rusak.");
  }
};

// ==============================================================================
// CONTROLLER: tampilDashboard
// Fungsi untuk menampilkan dashboard (misalnya, menunjukkan jumlah barang rusak)
// ==============================================================================
const tampilDashboard = async (req, res) => {
  try {
    const barangRusak = await Aset.findAll({
      where: { kondisi: "Rusak" },
    });

    res.render("Laporan", { barangRusak }); // sesuaikan dengan nama file view-nya
  } catch (error) {
    console.error("Gagal mengambil data barang rusak untuk dashboard:", error);
    res.status(500).send("Gagal memuat dashboard");
  }
};

// ==============================================================================
// CONTROLLER: getLaporanDikembalikan
// Fungsi untuk menampilkan laporan barang yang *sudah* dikembalikan (di halaman web).
// ==============================================================================
const getLaporanDikembalikan = async (req, res) => {
  try {
    const dataPengembalian = await PengembalianBarang.findAll({
      where: {
        status_pengembalian: "Sudah Dikembalikan",
      },
      order: [["tanggal_kembali", "DESC"]], // Urutkan berdasarkan tanggal aktual kembali
    });

    res.render("ExportPengembalian", {
      // Pastikan nama file EJS ini benar
      laporanPengembalian: dataPengembalian, // Nama variabel yang akan diakses di EJS
    });
  } catch (error) {
    console.error("Error saat mengambil data laporan pengembalian:", error);
    res.status(500).send("Terjadi kesalahan saat memuat laporan.");
  }
};

// ==============================================================================
// CONTROLLER: exportLaporanPengembalian (Nama fungsi diubah dari exportLaporanDikembalikan yang duplikat)
// Fungsi untuk mengekspor data laporan barang yang sudah dikembalikan ke CSV, Excel, atau PDF.
// ==============================================================================
const exportLaporanPengembalian = async (req, res) => {
  try {
    const { format } = req.body;

    const dataToExport = await PengembalianBarang.findAll({
      where: {
        status_pengembalian: "Sudah Dikembalikan",
      },
      order: [["tanggal_kembali", "DESC"]],
      raw: true,
    });

    const headers = [
      "Kode Barang",
      "Nama Barang",
      "Nama Peminjam",
      "Email",
      "No HP",
      "Tanggal Pinjam",
      "Tanggal Kembali", // Ini akan menjadi Tanggal Aktual Kembali
      "Kondisi",
    ];

    const formattedData = dataToExport.map((item) => ({
      "Kode Barang": item.kode_barang,
      "Nama Barang": item.nama_barang,
      "Nama Peminjam": item.nama_peminjam,
      Email: item.email,
      "No HP": item.no_hp,
      "Tanggal Pinjam": item.tanggal_pinjam
        ? new Date(item.tanggal_pinjam).toLocaleDateString("id-ID")
        : "",
      "Tanggal Kembali": item.tanggal_kembali
        ? new Date(item.tanggal_kembali).toLocaleDateString("id-ID")
        : "", // Gunakan tanggal_aktual_kembali
      Kondisi: item.kondisi,
    }));

    const fileName = `laporan_pengembalian_${new Date()
      .toISOString()
      .slice(0, 10)}`;

    switch (format) {
      case "csv":
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}.csv"`
        );
        stringify(formattedData, { header: true }).pipe(res);
        break;

      case "excel":
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Laporan Pengembalian");

        worksheet.columns = headers.map((header) => ({
          header: header,
          key: header,
          width: 20,
        }));

        formattedData.forEach((row) => {
          worksheet.addRow(row);
        });

        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}.xlsx"`
        );
        await workbook.xlsx.write(res);
        res.end();
        break;

      case "pdf":
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}.pdf"`
        );
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        // Judul
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .fillColor("#333")
          .text("Laporan Barang Dikembalikan", { align: "center" });
        doc.moveDown(1);

        const headers = [
          "No",
          "Kode Barang",
          "Nama Barang",
          "Peminjam",
          "Email",
          "No HP",
          "Tgl Pinjam",
          "Tgl Kembali",
          "Kondisi",
        ];
        const colWidths = [25, 60, 80, 80, 70, 60, 60, 60, 45];

        let drawTableHeader = () => {
          let x = doc.page.margins.left;
          let y = doc.y;

          doc
            .rect(
              x,
              y,
              colWidths.reduce((a, b) => a + b),
              20
            )
            .fill("#f0f0f0"); // background warna header
          doc.fillColor("#000").fontSize(8).font("Helvetica-Bold");

          headers.forEach((header, i) => {
            doc.text(header, x + 2, y + 6, {
              width: colWidths[i] - 4,
              align: "left",
            });
            x += colWidths[i];
          });

          doc.moveDown();
          doc.y += 5;
        };

        const drawRow = (data, yStart) => {
          let x = doc.page.margins.left;
          doc.font("Helvetica").fontSize(7).fillColor("#000");

          data.forEach((val, i) => {
            doc.text(String(val), x + 2, yStart + 4, {
              width: colWidths[i] - 4,
              align: "left",
            });
            x += colWidths[i];
          });

          // Border garis bawah tiap baris
          doc
            .moveTo(doc.page.margins.left, yStart + 16)
            .lineTo(doc.page.width - doc.page.margins.right, yStart + 16)
            .strokeColor("#ccc")
            .lineWidth(0.5)
            .stroke();
        };

        drawTableHeader();

        let y = doc.y;
        formattedData.forEach((item, index) => {
          if (y + 20 > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            drawTableHeader();
            y = doc.y;
          }

          const row = [
            index + 1,
            item["Kode Barang"],
            item["Nama Barang"],
            item["Nama Peminjam"],
            item["Email"],
            item["No HP"],
            item["Tanggal Pinjam"],
            item["Tanggal Kembali"],
            item["Kondisi"],
          ];

          drawRow(row, y);
          y += 20;
        });

        // Tambahkan nomor halaman di footer
        const range = doc.bufferedPageRange(); // { start: 0, count: N }
        for (let i = 0; i < range.count; i++) {
          doc.switchToPage(i);
          doc
            .fontSize(6)
            .fillColor("#888")
            .text(
              `Halaman ${i + 1} dari ${range.count}`,
              doc.page.margins.left,
              doc.page.height - 40,
              {
                align: "center",
                width:
                  doc.page.width -
                  doc.page.margins.left -
                  doc.page.margins.right,
              }
            );
        }

        doc.end();
        break;
    }
  } catch (error) {
    console.error("Error saat mengekspor laporan pengembalian:", error);
    res.status(500).send("Terjadi kesalahan server saat mengekspor laporan.");
  }
};

module.exports = {
  tampilBarangRusak,
  exportBarangRusak,
  tampilDashboard,
  getLaporanDikembalikan,
  exportLaporanPengembalian, // Nama sudah diubah di sini
};
