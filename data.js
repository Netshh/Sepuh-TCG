const cards = [
  {
    name: "Pak Murod",
    image: "cards/pak-murod.png",
    attack: 50,
    hp: 200,
    description: "Ngamuk pas sahur. Lempar balok kayu!"
  },
  {
    name: "Ujang Lembab",
    image: "cards/ujang-lembab.png",
    attack: 90,
    hp: 120,
    description: "Jago ngibrit saat hujan. Lemes tapi bahaya."
  },
  {
    name: "Jenggot",
    image: "cards/jenggot-card.png",
    attack: 60,
    hp: 120,
    description: "Jenggotnya bisa nyapu lantai. Makin panjang, makin sakti."
  },
  {
    name: "Haceng",
    image: "cards/haceng-card.png",
    attack: 60,
    hp: 120,
    description: "Lempar jokes tiap lima menit. Ngakak dulu, baru mikir."
  },
  {
    name: "Honcot Vstar",
    image: "cards/Honcot-vstar.png",
    attack: 30,
    hp: 260,
    description: "Suka nyolek tiba-tiba. Kalau udah bergetar, siap-siap kaget."
  },
  {
    name: "Jokang",
    image: "cards/Jokang-Card.png",
    attack: 80,
    hp: 200,
    description: "Colekannya dingin dan sunyi. Getarannya bikin merinding, bukan ketawa."
  },
  {
    name: "Joko Kendil",
    image: "cards/Joko-Kendil Card.png",
    attack: 70,
    hp: 120,
    description: "Pengembara sepi jalan. Ditemani khodam macan putih yang siap menerkam."
  },
  {
    name: "Kang Kejut EX",
    image: "cards/Kang Kejut-Card.png",
    attack: 80,
    hp: 120,
    description: "Tegangannya misteri. Bisa nyetrum kapan aja, bahkan waktu salaman."
  },
  {
    name: "Ki Bau",
    image: "cards/Ki Bau-Card.png",
    attack: 120,
    hp: 150,
    description: "Ninja bersarung. Serangannya bau menyengat, bikin musuh linglung sebelum sadar."
  },
  {
    name: "Ki Bulu Bibir",
    image: "cards/Ki Bulu Bibir-Card.png",
    attack: 70,
    hp: 140,
    description: "Jenggotnya panjang sampai ubin. Tiap helai menyimpan rahasia leluhur."
  },
  {
    name: "Ki Jagat Maya",
    image: "cards/ki jagat maya-card.png",
    attack: 70,
    hp: 120,
    description: "Tak banyak bicara, tapi semua server bergetar. Ia menguasai dunia dari balik terminal."
  },
  {
    name: "Ki Joko Bonyok",
    image: "cards/Ki joko bonyok-card.png",
    attack: 50,
    hp: 120,
    description: "Datang sebagai pahlawan, pulang tinggal sendal. Tapi tetap tersenyum."
  },
  {
    name: "Kokop",
    image: "cards/Kokop Ultra-Rare Card.png",
    attack: 120,
    hp: 90,
    description: "Penghisap terong tanpa ampun. Sekali sedot, tinggal batang kenangan."
  },
  {
    name: "Mas Tur",
    image: "cards/Mas Tur-Card.png",
    attack: 100,
    hp: 120,
    description: "Ahli cairan misterius. Sekali kendali, yang encer bisa jadi lengket."
  },
  {
    name: "Mbah Benu",
    image: "cards/Mbah Benu-Card.png",
    attack: 100,
    hp: 140,
    description: "Tidak perlu sinyal. Sekali bisik, langit bisa gemetar."
  },
  {
    name: "Nonchalant",
    image: "cards/nonchalant-card.png",
    attack: 60,
    hp: 130,
    description: "Diserang? Bodo amat. Ekspresinya datar, jiwanya lebih datar lagi."
  },
  {
    name: "Pak Bobo",
    image: "cards/Pak Bobo-Card.png",
    attack: 100,
    hp: 120,
    description: "Tidur adalah hidup. Bangun cuma buat pindah posisi."
  },
  {
    name: "Pak Rehat",
    image: "cards/pak rehat-card.png",
    attack: 100,
    hp: 150,
    description: "Ayahnya Pak Bobo. Tidurnya bukan malas—itu meditasi tingkat dewa."
  },
  {
    name: "Pak Mangap",
    image: "cards/pak mangap-card.png",
    attack: 50,
    hp: 120,
    description: "Mulutnya jarang tutup. Kaget dikit, langsung mangap bareng."
  },
  {
    name: "Pak Sengir (Sinis Nyengir)",
    image: "cards/pak sengir-card.png",
    attack: 60,
    hp: 90,
    description: "Jokes-nya garing, tapi nyengir terus. Musuh bingung antara ketawa atau pulang."
  },
  {
    name: "Pak Sinis",
    image: "cards/pak sinis-card.png",
    attack: 100,
    hp: 230,
    description: "Tatapannya tajam, penuh penghakiman. Belum nyerang aja musuh udah insecure."
  },
  {
    name: "Pak Tedi",
    image: "cards/Pak Tedi-Card.png",
    attack: 70,
    hp: 120,
    description: "Tukang cor jalan bersuara emas. Nyanyi sambil kerja, bikin supir terharu."
  },
  {
    name: "Shirotol",
    image: "cards/shirotol-card.png",
    attack: 70,
    hp: 90,
    description: "Mandi jam Nol Nol, senyum tanpa sebab. Tetangga udah pasrah, air PDAM pun takut."
  },
  {
    name: "Tono Bloon",
    image: "cards/Tono Bloon-Card.png",
    attack: 50,
    hp: 90,
    description: "Ceroboh, bloon, tapi nekat. Kadang nyerang musuh, kadang malah nyetrum diri sendiri."
  },
  {
    name: "Ki Metal",
    image: "cards/ki metal-card.png",
    attack: 130,
    hp: 140,
    description: "Rambut uban, gitar listrik. Tiap petikan bikin telinga lawan pensiun dini."
  },
  {
    name: "Babeh Ngepot",
    image: "cards/Babeh Ngepot-card.png",
    attack: 100,
    hp: 180,
    description: "Ontelnya tua, tapi ngepotnya sadis. Belok sambil ngedrift, bikin debu naik sampe ke akhirat."
  },

  // Tambah kartu lain di sini
];
