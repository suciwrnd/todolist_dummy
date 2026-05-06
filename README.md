# ⚔️ QuestLog: Boss Raid Productivity

> Aplikasi manajemen tugas bergaya RPG — selesaikan quest, serang boss, dan naik level!

---

## 📌 Deskripsi Proyek

**QuestLog** adalah aplikasi produktivitas berbasis web yang menggunakan mekanik game RPG untuk memotivasi pengguna menyelesaikan tugas sehari-hari. Setiap tugas (quest) yang diselesaikan akan memberikan XP dan damage ke boss. Jika deadline terlewat, pemain kehilangan Energy (HP). Boss yang dikalahkan memberikan Gold dan item loot.

Proyek ini dibuat sebagai tugas mata kuliah **Pemrograman Berbasis Web (PBW)** dan berjalan sepenuhnya di sisi klien (*frontend only*) — tanpa backend server.

---

## 🛠️ Framework & Teknologi yang Digunakan

| Teknologi | Versi | Kegunaan |
|---|---|---|
| **HTML5** | - | Struktur halaman |
| **CSS3 (Vanilla)** | - | Styling kustom, animasi, glassmorphism |
| **JavaScript (Vanilla)** | ES6+ | Logika game, autentikasi, manajemen quest |
| **Bootstrap** | 5.3.2 | Grid layout, komponen UI (modal, badge, progress bar) |
| **Font Awesome** | 6.4.2 | Ikon-ikon di seluruh antarmuka |
| **Google Fonts** | - | Font `Poppins` untuk tipografi premium |

> ⚠️ **Tidak ada backend, tidak ada database.** Semua data disimpan di `localStorage` dan `sessionStorage` browser.

---

## 📁 Struktur File

```
todolist_dummy-fix/
│
├── index.html          # Halaman utama dashboard (Quest Board, Boss Arena, Shop)
├── login.html          # Halaman login
├── register.html       # Halaman registrasi
├── users.txt           # File dummy data pengguna default (admin, player)
│
└── assets/
    ├── css/
    │   └── style.css   # Seluruh styling kustom & animasi
    └── js/
        ├── auth.js     # Sistem autentikasi (login, register, logout, guard)
        ├── game.js     # Mekanik game (XP, HP, level, boss, loot, shop)
        ├── quests.js   # Manajemen quest (tambah, selesaikan, hapus, deadline)
        └── main.js     # Inisialisasi & widget kalender
```

---

## 🚀 Cara Menjalankan

Karena ini proyek **frontend murni**, tidak perlu instalasi apapun.

### Opsi 1 — Buka Langsung (File Browser)
1. Buka folder proyek
2. Klik dua kali `login.html` atau `index.html`
3. Login dengan akun default:
   - Username: `admin` | Password: `password123`
   - Username: `player` | Password: `123`

> ⚠️ Saat dibuka via `file://`, fetch ke `users.txt` akan diblokir CORS. Aplikasi otomatis menggunakan **data fallback** (admin & player) yang sudah di-hardcode.

### Opsi 2 — Gunakan Live Server (Direkomendasikan)
1. Install ekstensi **Live Server** di VS Code
2. Klik kanan `login.html` → **Open with Live Server**
3. Aplikasi berjalan di `http://localhost:5500`

---

## 🔐 Sistem Autentikasi (`auth.js`)

Karena tidak ada backend, autentikasi disimulasikan menggunakan kombinasi **file teks + localStorage + sessionStorage**.

### Alur Data Login

```
1. Pengguna input username & password di login.html
2. auth.js memanggil getUsers():
   │
   ├── Jika protocol = file:// → pakai hardcoded fallback data
   └── Jika protocol = http:// → fetch('users.txt') untuk data default
       │
       └── Gabungkan dengan customUsers dari localStorage
           (pengguna yang registrasi mandiri)
3. Cocokkan input dengan data users
4. Jika cocok → simpan username ke sessionStorage['questlog_user']
5. Redirect ke index.html
```

### Format `users.txt`

```
username,password,level
admin,password123,0
player,123,0
```

### Penyimpanan Session

| Storage | Key | Isi |
|---|---|---|
| `sessionStorage` | `questlog_user` | Username yang sedang login |
| `localStorage` | `questlog_custom_users` | Array JSON pengguna yang registrasi |
| `localStorage` | `questlog_gamestate_<username>` | State game per pengguna |
| `localStorage` | `questlog_quests_<username>` | Data quest per pengguna |

### Route Guard

Setiap halaman dilindungi oleh pengecekan di `DOMContentLoaded`:

```javascript
// Jika belum login dan bukan di halaman login/register → redirect ke register
if (!isLoggedIn && !isLoginOrRegister) {
    window.location.href = 'register.html';
}

// Jika sudah login tapi buka login/register → redirect ke index
if (isLoggedIn && isLoginOrRegister) {
    window.location.href = 'index.html';
}
```

---

## 🎮 Mekanik Game (`game.js`)

### Sistem XP & Level

```javascript
// XP yang dibutuhkan per level (semakin tinggi level, semakin banyak XP)
function getRequiredXp(level) {
    return BASE_XP_REQ * level; // 100 * level
}

// Contoh:
// Level 1 → butuh 100 XP
// Level 2 → butuh 200 XP
// Level 3 → butuh 300 XP
```

Fungsi `addXp()` menggunakan **while loop** agar level naik berurutan (tidak loncat):

```javascript
function addXp(amount) {
    gameState.xp += amount;

    let reqXp = getRequiredXp(gameState.level);
    while (gameState.xp >= reqXp && reqXp > 0) {
        gameState.level++;
        gameState.xp -= reqXp;
        gameState.hp = MAX_HP; // HP pulih saat naik level
        reqXp = getRequiredXp(gameState.level); // hitung ulang untuk level berikutnya
    }
}
```

### Sistem HP (Energy)

- HP maksimum: **100**
- HP berkurang saat quest gagal (deadline terlewat) sesuai rank quest
- HP dipulihkan penuh saat **naik level**
- Jika HP ≤ 0 → pemain **pingsan**, kehilangan **50% Gold**, HP direset ke 100

### Sistem Boss

| Properti | Detail |
|---|---|
| HP Awal | 500 |
| HP per Boss berikutnya | `500 + (bossLevel × 200)` |
| Damage dari quest E | 20 |
| Damage dari quest C | 50 |
| Damage dari quest S | 150 |

Saat boss dikalahkan → muncul modal **Victory**, pemain bisa buka **Loot Box** berisi Gold dan item acak.

### Reward & Rank Quest

| Rank | XP | Damage ke Boss | Penalti HP (jika gagal) |
|---|---|---|---|
| E (Mudah) | 10 XP | 20 | 20 HP |
| C (Sedang) | 30 XP | 50 | 50 HP |
| S (Sulit) | 100 XP | 150 | 150 HP |

### Gelar Pemain

| Level | Gelar |
|---|---|
| 1–4 | Petualang Pemula |
| 5–9 | Prajurit Berpengalaman |
| 10+ | Pahlawan Waktu |

### Penyimpanan State

State game disimpan ke `localStorage` setiap ada perubahan:

```javascript
function saveGame() {
    localStorage.setItem(getSaveKey(), JSON.stringify(gameState));
    updateUI();
}

// Key unik per pengguna
function getSaveKey() {
    const user = sessionStorage.getItem('questlog_user') || 'guest';
    return `questlog_gamestate_${user}`;
}
```

---

## 📋 Sistem Quest (`quests.js`)

### Alur Menambah Quest

1. Klik tombol **"New Quest"** → buka modal
2. Isi: Judul, Rank (E/C/S), Kategori, Deadline
3. Submit → quest ditambahkan ke array `quests[]` → disimpan ke localStorage

### Alur Menyelesaikan Quest

```
Klik tombol ✓ pada quest
    → Animasi centang (400ms delay)
    → addXp(config.xp)         // tambah XP, cek level up
    → dealDamageToBoss(config.damage) // kurangi HP boss
    → saveQuests() + renderQuests()
```

### Sistem Deadline

Setiap **60 detik**, fungsi `checkDeadlines()` berjalan otomatis:

```javascript
setInterval(checkDeadlines, 60000);
checkDeadlines(); // cek langsung saat load
```

Jika waktu sekarang melewati deadline quest yang belum selesai:
- Quest ditandai `failed: true`
- Pemain kena damage sesuai rank quest
- Quest tetap tampil dengan tanda **GAGAL** dan dicoret

### Menghapus Quest

Jika quest dihapus **sebelum selesai/gagal**, pemain kena penalti **10 HP** sebagai hukuman meninggalkan quest.

---

## 🖼️ Foto Boss — Dari Mana?

Gambar boss diambil dari layanan **RoboHash** (https://robohash.org) — sebuah API publik gratis yang menghasilkan gambar unik berbasis teks/seed:

```html
<img src="https://robohash.org/questlog_boss_1.png?set=set2&size=220x220" />
```

- `set=set2` → menggunakan set gambar monster/robot
- `size=220x220` → ukuran gambar
- Seed `questlog_boss_1` → menghasilkan gambar konsisten (selalu sama untuk seed yang sama)
- Tidak perlu upload atau host gambar sendiri

---

## 🎨 Desain & Styling (`style.css`)

### Palet Warna

| Nama | Kode Hex | Fungsi |
|---|---|---|
| Background Gelap | `#0f0f1a` | Latar utama |
| Kuning-Hijau Aksen | `#dcf516` | Tombol, highlight, XP bar |
| Merah Tua | `#9d1f1a` | Warna boss, bahaya |
| Merah Terang | `#ff4d4d` | Efek glow bahaya |
| Hijau | `#00e676` | HP bar pemain, sukses |
| Biru Cyan | `#00e5ff` | Info, XP teks |

### Efek Visual

- **Glassmorphism** — kartu dengan `backdrop-filter: blur()` dan gradien transparan
- **Animasi `shake`** — diterapkan ke HP bar pemain dan gambar boss saat terkena damage
- **Animasi `slashDraw`** — efek tebasan diagonal saat quest diselesaikan
- **Animasi `float`** — gambar boss melayang naik-turun secara halus
- **Animasi `fadeIn`** — setiap quest baru muncul dengan transisi fade

---

## 🗓️ Widget Kalender (`main.js`)

Kalender sederhana di-render dengan JavaScript murni — tanpa library eksternal:

```javascript
function renderSimpleCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // hari pertama bulan
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // total hari

    // Tambahkan slot kosong untuk offset hari pertama
    for (let i = 0; i < firstDay; i++) { ... }

    // Render setiap hari, tandai hari ini
    for (let i = 1; i <= daysInMonth; i++) {
        if (i === currentDate) dayDiv.classList.add('today');
    }
}
```

---

## 👤 Akun Default

| Username | Password | Keterangan |
|---|---|---|
| `admin` | `password123` | Akun bawaan dari `users.txt` |
| `player` | `123` | Akun bawaan dari `users.txt` |

Pengguna baru bisa registrasi mandiri — data disimpan di `localStorage` browser.

> ⚠️ Data registrasi bersifat **lokal per browser**. Jika localStorage dibersihkan atau buka di browser lain, akun akan hilang.

---

## ⚙️ Keterbatasan Sistem

| Keterbatasan | Penjelasan |
|---|---|
| Tidak ada backend | Data hanya tersimpan di browser pengguna |
| Tidak ada enkripsi password | Password disimpan plaintext di localStorage |
| Data tidak sinkron antar perangkat | Tiap browser/device punya data sendiri |
| `users.txt` tidak bisa ditulis | Pengguna baru tidak bisa ditambahkan ke file txt secara otomatis |
| CORS saat buka via `file://` | Fetch ke `users.txt` diblokir, menggunakan fallback data |

---

## 📸 Screenshot

> Buka `index.html` di browser untuk melihat tampilan lengkap aplikasi.

Halaman yang tersedia:
- **`register.html`** — Halaman buat akun hero baru
- **`login.html`** — Halaman masuk ke realm
- **`index.html`** — Dashboard utama dengan Quest Board, Boss Arena, Inventaris, dan Toko

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan akademik — **Pemrograman Berbasis Web (PBW)**.  
Bebas digunakan dan dimodifikasi untuk tujuan pembelajaran.
