# KelasKosong

KelasKosong adalah aplikasi web untuk membantu mahasiswa menemukan dan memesan ruang kampus yang sesuai dengan kebutuhan mereka. Pengguna dapat mencari berdasarkan gedung, kapasitas, waktu, tipe ruang, dan fasilitas, lalu melihat apakah ruang tersedia untuk seluruh rentang waktu yang dipilih.

Dokumen ini menjelaskan tujuan dan ruang lingkup produk. Rancangan teknis lebih lengkap ada di [Architecture.md](Architecture.md).

## Masalah yang ingin diselesaikan

Mahasiswa sering baru mengetahui sebuah ruang kosong setelah datang langsung atau bertanya melalui grup. Pada saat yang sama, slot ruang kampus dapat tidak terpakai atau digunakan tanpa koordinasi yang jelas.

KelasKosong menyatukan informasi ruang dan reservasi agar mahasiswa dapat merencanakan belajar, diskusi kelompok, atau kegiatan organisasi sebelum menuju lokasi. Aplikasi ini mengelola informasi dan jadwal; MVP tidak terhubung dengan sistem reservasi resmi kampus atau sensor okupansi.

## Pengguna

- **Mahasiswa** mencari ruang, membuat dan mengelola reservasi miliknya, serta melihat riwayat penggunaan.
- **Pengelola fasilitas** memasukkan dan memperbarui data ruang serta membantu menangani reservasi untuk kebutuhan operasional.
- **Pengunjung** dapat menjelajahi katalog; login diperlukan untuk membuat reservasi.

## Manfaat

### Untuk mahasiswa

- Mengetahui pilihan ruang sebelum datang ke kampus.
- Menemukan ruang berdasarkan waktu, kapasitas, gedung, dan fasilitas.
- Mengurangi waktu mencari ruang serta ketergantungan pada informasi grup chat.
- Memberi tahu pengguna lain ketika selesai menggunakan ruang lebih awal.

### Untuk kampus

- Membantu pemanfaatan ruang yang tersedia.
- Menyediakan informasi reservasi yang lebih terkoordinasi.
- Memberi dasar data penggunaan untuk evaluasi operasional.

## Fitur MVP

1. **Registrasi dan login** agar reservasi terhubung ke akun pemesan.
2. **Katalog dan detail ruang** yang menampilkan nama, gedung/lantai, kapasitas, tipe, deskripsi, fasilitas, dan ketersediaan.
3. **Pencarian dan filter** berdasarkan tanggal, jam mulai/selesai, kapasitas, gedung, tipe, serta fasilitas.
4. **Reservasi ruang** untuk rentang waktu tertentu.
5. **Pencegahan bentrok** supaya dua reservasi aktif tidak menggunakan ruang yang sama pada waktu tumpang tindih.
6. **Pembatalan reservasi** sesuai aturan pembatalan yang ditetapkan.
7. **Selesai lebih awal** bagi pemesan yang sedang menggunakan ruang. Waktu akhir aktual dicatat agar slot setelahnya dapat ditawarkan.
8. **Riwayat reservasi** yang akan datang dan sebelumnya.
9. **Pengelolaan data ruang** oleh pengelola.

### Cara membaca status ruang

Untuk tanggal dan jam yang dipilih, ruang ditandai **Tersedia** jika tidak ada reservasi aktif yang bertabrakan dengan keseluruhan rentang tersebut. **Sedang digunakan** menunjukkan reservasi yang berlangsung pada waktu sekarang. **Akan tersedia** memberi konteks kapan reservasi berjalan berakhir; status ini sendiri tidak menjamin seluruh slot yang dicari tersedia.

Status dihitung dari data reservasi, bukan disimpan sebagai status manual yang dapat kedaluwarsa. Pembaruan tampil setelah perubahan tersimpan dan data dimuat ulang. Pembaruan live lintas perangkat belum termasuk MVP.

## Di luar MVP

- Integrasi dengan sistem akademik atau jadwal kuliah resmi kampus.
- Integrasi kartu mahasiswa, NFC, smart lock, atau akses pintu otomatis.
- Sensor IoT atau computer vision untuk mendeteksi keberadaan orang.
- Pembayaran fasilitas.
- Push notification atau pembaruan live menggunakan WebSocket.
- Sinkronisasi kalender eksternal.
- Rekomendasi AI dan prediksi penggunaan dengan machine learning.
- Aplikasi mobile native dan administrasi kampus berskala penuh.

## Alur utama

1. Mahasiswa memilih tanggal, jam, kapasitas, dan filter lain.
2. Aplikasi menampilkan ruang yang memenuhi kebutuhan dan tersedia untuk rentang itu.
3. Mahasiswa login bila belum masuk, lalu memilih ruang dan mengirim reservasi.
4. Server memeriksa ulang jadwal sebelum menyimpan agar slot yang baru saja dipesan pengguna lain tidak ikut terjual.
5. Mahasiswa melihat konfirmasi dan reservasi di halaman riwayat.
6. Saat penggunaan berlangsung, pemesan dapat memilih **Selesai lebih awal**. Ruang menjadi tersedia untuk waktu setelah waktu selesai aktual.

## Batasan produk

- Daftar ruang dimasukkan dan dikelola secara manual oleh pengelola.
- Informasi ketersediaan bersumber dari reservasi KelasKosong dan bukan sensor kondisi fisik ruangan.
- Pengelola menetapkan jam operasional dan aturan pembatalan yang digunakan kampus.
- “Tersedia” berarti tidak ada reservasi tercatat untuk slot itu; pengguna tetap perlu mengikuti aturan penggunaan fasilitas kampus.
- Semua waktu ditampilkan dalam zona waktu kampus yang dikonfigurasi.

## Kriteria keberhasilan

MVP memenuhi tujuannya ketika pengguna dapat:

- Membuat akun, masuk, dan melihat katalog ruang.
- Menemukan ruang berdasarkan slot, kapasitas, dan fasilitas.
- Melihat detail ruang dan status untuk waktu yang dipilih.
- Membuat reservasi tanpa menyebabkan bentrok dengan reservasi lain.
- Melihat, membatalkan sesuai aturan, dan meninjau riwayat reservasinya.
- Mengakhiri penggunaan lebih awal dan melihat ketersediaan diperbarui.

Kualitas data juga harus terjaga: waktu reservasi tersimpan dengan benar, ruang nonaktif tidak dapat dipesan, dan pengguna tidak dapat mengubah reservasi milik pengguna lain.

## Rancangan teknis

Produk dirancang sebagai aplikasi mobile React Native dengan Expo dan TypeScript, serta backend REST API (Node.js/Express), PostgreSQL, dan Prisma. Prototype pertemuan 3 adalah aplikasi mobile yang dijalankan melalui Expo. Prototype ini memakai data contoh lokal dan belum terhubung ke backend/database. Rincian model data, API, aturan waktu, dan keamanan tersedia di [Architecture.md](Architecture.md).

> Prototype mobile mensimulasikan alur pencarian dan reservasi dengan data contoh. Reservasi hanya hidup selama aplikasi berjalan dan tidak mewakili ketersediaan kampus yang sesungguhnya. Backend produksi belum tersedia.

## Menjalankan prototype mobile

Penjelasan layar, alur demo, struktur project, dan batas prototype: [penjelasanprototype.md](penjelasanprototype.md).

Persyaratan: Node.js LTS, npm, serta Expo Go pada perangkat atau Android Emulator. Dari terminal:

1. Masuk ke folder aplikasi dan pasang dependency (jika belum tersedia):

   ```bash
   cd mobile
   npm install
   ```

2. Jalankan Expo:

   ```bash
   npx expo start
   ```

3. Pindai QR code dengan Expo Go, atau tekan `a` untuk membuka Android Emulator.

Di prototype, tekan pilihan jumlah orang/waktu untuk mengganti nilai, pilih tipe ruang, simpan ruang dengan ikon hati, lalu pesan ruang untuk mencoba konfirmasi. Tab **Reservasi**, **Tersimpan**, dan **Profil** memakai navigasi native. Tanggal, akun, dan katalog masih berupa contoh.
