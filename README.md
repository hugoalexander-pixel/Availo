# KelasKosong

## Deskripsi Masalah

Di lingkungan kampus, mahasiswa sering membutuhkan tempat untuk belajar, mengerjakan tugas kelompok, berdiskusi, melakukan kegiatan organisasi, atau menggunakan fasilitas tertentu.

Namun, informasi mengenai ketersediaan fasilitas kampus sering kali tidak mudah ditemukan. Mahasiswa dapat mengetahui bahwa sebuah ruangan "tersedia" hanya setelah datang langsung ke lokasi atau bertanya kepada pihak lain.

Di sisi lain, beberapa ruangan dan fasilitas kampus sebenarnya memiliki slot waktu kosong yang tidak digunakan secara optimal.

Masalah yang ingin diselesaikan oleh KelasKosong adalah:

> Bagaimana membantu mahasiswa menemukan dan menggunakan fasilitas kampus yang sedang atau akan kosong tanpa harus mencari secara manual?

KelasKosong menyediakan informasi ketersediaan fasilitas secara terpusat sehingga mahasiswa dapat menemukan ruang yang sesuai berdasarkan lokasi, waktu, kapasitas, dan jenis fasilitas.

Aplikasi juga memungkinkan pengguna yang selesai menggunakan ruangan lebih awal untuk memberi tahu pengguna lain bahwa ruangan tersebut sudah tersedia.

---

## Profil Target Pengguna

### Pengguna Utama

Mahasiswa aktif yang:

* Membutuhkan ruangan untuk belajar atau mengerjakan tugas.
* Sering melakukan kerja kelompok.
* Mengikuti organisasi atau kegiatan kampus.
* Membutuhkan fasilitas kampus tertentu.
* Kesulitan mengetahui ruangan yang sedang tersedia.

### Pengguna Sekunder

Pengelola fasilitas kampus atau organisasi mahasiswa yang membutuhkan informasi mengenai penggunaan fasilitas.

---

## Manfaat Aplikasi

### Untuk Mahasiswa

* Menghemat waktu dalam mencari ruangan.
* Mengetahui fasilitas yang tersedia sebelum datang ke lokasi.
* Mempermudah pencarian ruangan berdasarkan kapasitas dan fasilitas.
* Mengurangi ketergantungan pada informasi dari grup chat.
* Memanfaatkan ruangan kosong secara lebih optimal.

### Untuk Kampus

* Meningkatkan utilisasi fasilitas.
* Memberikan gambaran mengenai pola penggunaan fasilitas.
* Mengurangi penggunaan ruangan yang tidak terkoordinasi.
* Membantu digitalisasi pengelolaan fasilitas.

---

## Daftar Fitur Inti

### 1. Login dan Registrasi

Pengguna dapat membuat akun dan masuk ke aplikasi.

Data dasar:

* Nama
* Email
* Password
* Status pengguna

---

### 2. Daftar Fasilitas

Pengguna dapat melihat daftar fasilitas yang tersedia.

Informasi fasilitas:

* Nama ruangan
* Gedung
* Kapasitas
* Jenis ruangan
* Fasilitas yang tersedia
* Status ketersediaan

Contoh:

```
Ruang Diskusi 302
Gedung A
Kapasitas: 8 orang

Fasilitas:
✓ Whiteboard
✓ AC
✓ Wi-Fi
```

---

### 3. Pencarian dan Filter

Pengguna dapat mencari fasilitas berdasarkan:

* Waktu
* Kapasitas
* Gedung
* Jenis fasilitas
* Status tersedia

Contoh:

> "Cari ruangan untuk 6 orang pukul 15.00."

Aplikasi menampilkan ruangan yang sesuai.

---

### 4. Reservasi Ruangan

Pengguna dapat memilih ruangan dan melakukan reservasi pada waktu tertentu.

Informasi reservasi:

* Nama ruangan
* Tanggal
* Waktu mulai
* Waktu selesai
* Jumlah pengguna
* Status reservasi

---

### 5. Status Ketersediaan Real-Time Sederhana

Ruangan memiliki status:

* 🟢 Tersedia
* 🟡 Akan tersedia
* 🔴 Sedang digunakan

Status dapat diperbarui berdasarkan reservasi dan laporan pengguna.

---

### 6. "Selesai Lebih Cepat"

Pengguna yang sedang menggunakan ruangan dapat melaporkan bahwa mereka telah selesai lebih awal.

Contoh:

Reservasi:

```
14.00–16.00
```

Namun kelompok selesai pukul:

```
15.10
```

Pengguna dapat menekan:

> "Saya selesai lebih awal"

Status ruangan kemudian berubah menjadi tersedia.

---

### 7. Pemberitahuan

Pengguna dapat menerima pemberitahuan ketika ruangan yang diinginkan menjadi tersedia.

Contoh:

> 🔔 Ruang Diskusi 302 sekarang tersedia.

---

### 8. Riwayat Reservasi

Pengguna dapat melihat:

* Reservasi yang akan datang.
* Reservasi yang sedang berjalan.
* Reservasi sebelumnya.
* Status reservasi.

---

## Fitur yang Tidak Dikerjakan

Untuk menjaga project tetap realistis dalam 12 pertemuan, fitur berikut tidak termasuk dalam versi awal:

* Integrasi dengan sistem akademik universitas.
* Integrasi dengan kartu mahasiswa/NFC.
* Pembayaran fasilitas.
* Smart lock atau pembukaan pintu otomatis.
* Integrasi IoT untuk mendeteksi keberadaan manusia.
* Computer vision untuk menghitung jumlah orang di ruangan.
* Sinkronisasi dengan seluruh kampus secara otomatis.
* Sistem rekomendasi berbasis AI.
* Prediksi penggunaan ruangan menggunakan machine learning.
* Integrasi kalender eksternal seperti Google Calendar.
* Sistem administrasi kampus berskala penuh.

---

## Kriteria Aplikasi Dinyatakan Berhasil

Aplikasi dinyatakan berhasil apabila pengguna dapat menyelesaikan alur berikut:

1. Membuat akun atau login.
2. Melihat daftar fasilitas kampus.
3. Mencari fasilitas berdasarkan waktu dan kapasitas.
4. Melihat detail fasilitas.
5. Melakukan reservasi.
6. Melihat status reservasi.
7. Membatalkan reservasi.
8. Melaporkan bahwa penggunaan ruangan telah selesai lebih awal.
9. Melihat ruangan yang tersedia setelah pembaruan status.
10. Melihat riwayat reservasi.

### Indikator keberhasilan

Project dianggap berhasil apabila:

* Seluruh alur utama dapat dilakukan tanpa error.
* Data reservasi tersimpan dengan benar.
* Dua pengguna tidak dapat melakukan reservasi pada slot waktu yang sama.
* Status fasilitas berubah sesuai kondisi reservasi.
* Pengguna dapat menemukan fasilitas yang sesuai melalui fitur pencarian/filter.
* Aplikasi dapat digunakan secara konsisten pada perangkat mobile.

### Batasan MVP

Versi pertama aplikasi menggunakan data fasilitas yang telah dimasukkan ke dalam sistem dan belum terintegrasi dengan sistem reservasi resmi universitas.

Tujuan MVP adalah membuktikan bahwa konsep **pencarian, penggunaan, dan redistribusi slot kosong fasilitas kampus** dapat berjalan dengan baik.
