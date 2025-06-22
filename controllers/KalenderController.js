const { PeminjamanBarang } = require('../models/PeminjamanBarangModel');
const { PengembalianBarang } = require('../models/PengembalianBarangModel');
const Event = require('../models/eventmodel'); // Path diperbaiki ke eventmodel.js

// Mengambil data untuk halaman Kalender
exports.getKalenderAktivitas = async (req, res) => {
  try {
    // Data event sekarang akan diambil melalui API, jadi render halaman saja
    res.render('KalenderAktivitas', { 
      title: 'Kalender Aktivitas',
      nama: req.session.nama 
    });
  } catch (err) {
    console.error("Gagal merender halaman kalender:", err);
    res.status(500).send("Error memuat halaman kalender");
  }
};

// Fungsi BARU untuk menyediakan data event sebagai API
exports.getEventsApi = async (req, res) => {
  try {
    console.log('=== DEBUG: getEventsApi dipanggil ===');
    
    // Mengambil data dari tabel pengembalian yang memiliki tanggal lengkap
    const historyEvents = await PengembalianBarang.findAll({
        attributes: ['nama_barang', 'tanggal_pinjam', 'tanggal_kembali']
    });
    console.log('History events found:', historyEvents.length);

    const kegiatanEvents = await Event.findAll();
    console.log('Kegiatan events found:', kegiatanEvents.length);
    console.log('Kegiatan events data:', JSON.stringify(kegiatanEvents, null, 2));

    const allEvents = [];

    // Proses data riwayat untuk membuat event "Pinjam" dan "Kembali"
    historyEvents.forEach(item => {
      // Tambahkan event untuk tanggal pinjam
      if (item.tanggal_pinjam) {
        allEvents.push({
          title: `Pinjam: ${item.nama_barang}`,
          start: item.tanggal_pinjam,
          backgroundColor: '#34D399', // Hijau
          borderColor: '#34D399'
        });
      }
      // Tambahkan event untuk tanggal kembali
      if (item.tanggal_kembali) {
        allEvents.push({
          title: `Kembali: ${item.nama_barang}`,
          start: item.tanggal_kembali,
          backgroundColor: '#60A5FA', // Biru
          borderColor: '#60A5FA'
        });
      }
    });

    // Tambahkan event kustom dari tabel 'event'
    kegiatanEvents.forEach(item => {
      allEvents.push({
        id: item.id,
        title: item.title,
        start: item.start,
        backgroundColor: '#F59E0B', // Oranye
        borderColor: '#F59E0B',
        extendedProps: {
          description: item.description,
          editable: true
        }
      });
    });

    console.log('Total events to be sent:', allEvents.length);
    console.log('All events data:', JSON.stringify(allEvents, null, 2));

    res.json(allEvents);
  } catch (err) {
    console.error("Gagal mengambil data event untuk API:", err);
    res.status(500).json({ message: "Gagal mengambil data event" });
  }
};


// Fungsi untuk menambah event baru
exports.tambahEvent = async (req, res) => {
  try {
    const { title, description, start } = req.body;
    
    const newEvent = await Event.create({ // Simpan ke model Event
      title,
      description,
      start,
    });

    // Kirim response dengan format yang sesuai dengan yang diharapkan frontend
    res.status(201).json({ 
      message: 'Event berhasil ditambahkan', 
      newEvent: {
        id: newEvent.id,
        title: newEvent.title,
        description: newEvent.description,
        start: newEvent.start
      }
    });
  } catch (err) {
    console.error("Gagal menambah event:", err);
    res.status(500).json({ message: 'Gagal menambah event' });
  }
}; 

// Fungsi BARU untuk mengupdate event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Event tidak ditemukan' });
    }

    event.title = title;
    event.description = description;
    await event.save();

    res.status(200).json({ 
      message: 'Event berhasil diperbarui', 
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start
      }
    });
  } catch (err) {
    console.error("Gagal memperbarui event:", err);
    res.status(500).json({ message: 'Gagal memperbarui event' });
  }
};

// Fungsi untuk menghapus event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ message: 'Event tidak ditemukan' });
    }

    await event.destroy();

    res.status(200).json({ message: 'Event berhasil dihapus' });
  } catch (err) {
    console.error("Gagal menghapus event:", err);
    res.status(500).json({ message: 'Gagal menghapus event' });
  }
}; 