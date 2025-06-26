// ✅ FINAL script.js FULLY FIXED dengan tombol Multiplayer & Lawan Bot, Preview Kartu, Animasi, dan Fix Loading

let draftPool = [];
let playerDeck = [];
let cpuDeck = [];
let isPlayerTurn = true;
let isDrafting = true;
let isGameOver = false;
let playerIndex = 0;
let cpuIndex = 0;
let playerHP = 0;
let cpuHP = 0;
let isBattling = false;
let isMultiplayer = false;
let opponentSocketId = null;
let socket = null;
let multiplayerTimeout = null;

const botComments = [
  "Hyaah! Serangan maut bot!",
  "Waduh, itu sakit juga!",
  "Sabar... aku masih punya dua lagi!",
  "Hehe, ini baru pemanasan~",
  "Kartu tua juga bisa marah!",
  "Aduh! Kok bisa kalah ya?",
  "Aku tidak takut kamu, sepuh!",
  "Dasar Kolot!",
  "bajingan!",
  "Rasakan Ini Tua!"
];

function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

function showBotComment(text) {
  const cpuCard = document.getElementById("cpu-card");
  if (!cpuCard) return;
  const bubble = document.createElement("div");
  bubble.className = "bot-bubble";
  bubble.textContent = text;
  Object.assign(bubble.style, {
    position: "absolute",
    background: "#444",
    color: "white",
    padding: "6px 10px",
    borderRadius: "10px",
    fontSize: "0.9rem",
    top: "-30px",
    left: "50%",
    transform: "translateX(-50%)",
    boxShadow: "0 0 6px rgba(0,0,0,0.4)",
    opacity: 0,
    transition: "opacity 0.4s ease"
  });
  cpuCard.style.position = "relative";
  cpuCard.appendChild(bubble);
  setTimeout(() => bubble.style.opacity = 1, 50);
  setTimeout(() => bubble.style.opacity = 0, 2000);
  setTimeout(() => bubble.remove(), 2500);
}

function preloadImagesWithProgress(imageUrls, callback) {
  let loaded = 0;
  const total = imageUrls.length;
  const bar = document.getElementById("loader-bar");
  const percent = document.getElementById("loader-percent");

  function updateProgress() {
    const progress = Math.floor((loaded / total) * 100);
    if (bar) bar.style.width = progress + "%";
    if (percent) percent.textContent = progress + "%";
  }

  if (total === 0) return callback();

  imageUrls.forEach((url) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      loaded++;
      updateProgress();
      if (loaded === total) callback();
    }, 7000);

    img.onload = img.onerror = () => {
      clearTimeout(timeout);
      loaded++;
      updateProgress();
      if (loaded === total) callback();
    };

    img.src = url;
  });
}

function setupModeButtons() {
  document.getElementById("btn-vs-bot").onclick = () => {
    isMultiplayer = false;
    startGame();
  };

  document.getElementById("btn-multiplayer").onclick = () => {
    isMultiplayer = true;
    startGame();
  };
}

function startGame() {
  document.getElementById("start-btns").style.display = "none";
  document.getElementById("result").textContent = "⏳ Loading asset...";
  const loader = document.getElementById("loader-overlay");
  loader.style.display = "flex";
  const music = document.getElementById("bg-music");
  const allImages = cards.map((c) => c.image);

  preloadImagesWithProgress(allImages, () => {
    loader.style.display = "none";
    music.volume = 0.2;
    music.play().catch(() => alert("Klik dibutuhkan untuk memutar musik."));
    if (isMultiplayer) {
      socket = io("https://sepuh-tcg-server.glitch.me");
      document.getElementById("result").textContent = "🔌 Menghubungkan ke server...";
      socket.on("connect", () => {
        console.log("Terkoneksi ke server:", socket.id);
        socket.emit("join_game");
        multiplayerTimeout = setTimeout(() => {
          document.getElementById("result").textContent = "🤖 Tidak ada lawan, kembali ke bot.";
          isMultiplayer = false;
          startDraft();
        }, 10000);
      });
      socket.on("waiting", (msg) => {
        document.getElementById("result").textContent = "🕒 " + msg;
      });
      socket.on("match_found", ({ room, players }) => {
        clearTimeout(multiplayerTimeout);
        document.getElementById("result").textContent = "🎮 Lawan ditemukan!";
        opponentSocketId = players.find((id) => id !== socket.id);
        startDraft();
      });
    } else {
      startDraft();
    }
  });
}

function startDraft() {
  draftPool = [...cards].sort(() => 0.5 - Math.random()).slice(0, 10);
  playerDeck = [];
  cpuDeck = [];
  isDrafting = true;
  isPlayerTurn = true;
  renderDraftPool();
}

function renderDraftPool() {
  const deckContainer = document.getElementById("deck");
  deckContainer.innerHTML = "";
  draftPool.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card selectable-card";
    cardDiv.innerHTML = `
      <img src="${card.image}" alt="${card.name}" />
      <h3>${card.name}</h3>
      <p><strong>ATK:</strong> ${card.attack} | <strong>HP:</strong> ${card.hp}</p>
    `;
    cardDiv.querySelector("img").onclick = () => showCardPreview(card);
    if (isDrafting && isPlayerTurn) {
      cardDiv.onclick = () => pickCard(index);
    }
    deckContainer.appendChild(cardDiv);
  });
  updateDraftStatus();
}

function pickCard(index) {
  if (!isPlayerTurn || !isDrafting) return;
  const chosen = draftPool.splice(index, 1)[0];
  playerDeck.push(chosen);
  isPlayerTurn = false;
  renderDraftPool();

  if (!isMultiplayer) {
    setTimeout(() => {
      const randIndex = Math.floor(Math.random() * draftPool.length);
      const botCard = draftPool.splice(randIndex, 1)[0];
      cpuDeck.push(botCard);
      renderDraftPool();
      if (playerDeck.length + cpuDeck.length < 6) {
        isPlayerTurn = true;
        updateDraftStatus();
      } else {
        isDrafting = false;
        updateDraftStatus();
        startBattle();
      }
    }, 600);
  } else {
    socket.emit("player_pick", chosen);
    document.getElementById("result").textContent = "Menunggu lawan memilih...";
  }
}

function updateDraftStatus() {
  const resultBox = document.getElementById("result");
  if (isDrafting) {
    resultBox.textContent = isPlayerTurn ? "🧍 Pilih kartu kamu" : "⌛ Menunggu...";
  } else {
    resultBox.textContent = "";
  }
}

function startBattle() {
  document.getElementById("deck").style.display = "none";
  document.getElementById("battlefield").style.display = "flex";
  playerIndex = 0;
  cpuIndex = 0;
  playerHP = playerDeck[playerIndex].hp;
  cpuHP = (isMultiplayer ? playerDeck : cpuDeck)[cpuIndex].hp;
  renderCard(playerDeck[playerIndex], "player-card", playerHP);
  renderCard((isMultiplayer ? playerDeck : cpuDeck)[cpuIndex], "cpu-card", cpuHP);
  isBattling = true;
  setTimeout(() => duelTurn(), 1000);
}

function renderCard(card, targetId, overrideHP = null) {
  const target = document.getElementById(targetId);
  const hp = overrideHP !== null ? overrideHP : card.hp;
  const hpPercent = Math.max(0, Math.min(100, hp));
  let hpClass = "hp-high";
  if (hpPercent <= 60) hpClass = "hp-medium";
  if (hpPercent <= 30) hpClass = "hp-low";
  target.innerHTML = `
    <img src="${card.image}" alt="${card.name}" />
    <h3>${card.name}</h3>
    <p>${card.description}</p>
    <p><strong>ATK:</strong> ${card.attack} | <strong>HP:</strong> ${card.hp}</p>
    <div class="hp-bar-container">
      <div class="hp-bar ${hpClass}" style="width: ${hpPercent}%" id="${targetId}-hpbar"></div>
    </div>
  `;
}

function updateHPBar(targetId, newHP) {
  const bar = document.getElementById(`${targetId}-hpbar`);
  const percent = Math.max(0, Math.min(100, newHP));
  let hpClass = "hp-high";
  if (percent <= 60) hpClass = "hp-medium";
  if (percent <= 30) hpClass = "hp-low";
  if (bar) {
    bar.style.width = percent + "%";
    bar.className = `hp-bar ${hpClass}`;
  }
}

function duelTurn() {
  if (!isBattling) return;
  cpuHP = Math.max(0, cpuHP - playerDeck[playerIndex].attack);
  updateHPBar("cpu-card", cpuHP);
  setTimeout(() => {
    if (cpuHP <= 0) {
      cpuIndex++;
      if (cpuIndex >= (isMultiplayer ? playerDeck.length : cpuDeck.length)) return declareVictory("player");
      cpuHP = (isMultiplayer ? playerDeck : cpuDeck)[cpuIndex].hp;
      renderCard((isMultiplayer ? playerDeck : cpuDeck)[cpuIndex], "cpu-card", cpuHP);
    } else if (!isMultiplayer) {
      const randomTalk = botComments[Math.floor(Math.random() * botComments.length)];
      showBotComment(randomTalk);
    }
  }, 300);

  setTimeout(() => {
    playerHP = Math.max(0, playerHP - (isMultiplayer ? playerDeck[cpuIndex].attack : cpuDeck[cpuIndex].attack));
    updateHPBar("player-card", playerHP);
    setTimeout(() => {
      if (playerHP <= 0) {
        playerIndex++;
        if (playerIndex >= playerDeck.length) return declareVictory("cpu");
        playerHP = playerDeck[playerIndex].hp;
        renderCard(playerDeck[playerIndex], "player-card", playerHP);
      }
      setTimeout(() => duelTurn(), 800);
    }, 400);
  }, 800);
}

function declareVictory(winner) {
  isBattling = false;
  isGameOver = true;
  const resultBox = document.getElementById("result");
  resultBox.className = "";
  if (winner === "player") {
    resultBox.textContent = "🏆 Kamu Menang!";
    resultBox.classList.add("win");
    playSound("win-sound");
    if (!isMultiplayer) showBotComment("Arrghh! Abah kalah! Kamu kuat juga... 😵");
  } else {
    resultBox.textContent = "💀 Kamu Kalah!";
    resultBox.classList.add("lose");
    playSound("lose-sound");
    if (!isMultiplayer) showBotComment("Hehe! Dasar sepuh pensiunan! 😎");
  }
  document.getElementById("reset-btn").style.display = "inline-block";
}

function showCardPreview(card) {
  let existing = document.getElementById("card-preview-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "card-preview-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.8)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  });
  const cardBox = document.createElement("div");
  cardBox.style = "background:#222;padding:1rem;border-radius:10px;color:#fff;text-align:center;max-width:90%";
  cardBox.innerHTML = `
    <img src="${card.image}" style="max-width:300px;border-radius:10px" />
    <h2>${card.name}</h2>
    <p><strong>ATK:</strong> ${card.attack} | <strong>HP:</strong> ${card.hp}</p>
    <p>${card.description}</p>
    <button onclick="document.getElementById('card-preview-overlay').remove()">Tutup</button>
  `;
  overlay.appendChild(cardBox);
  document.body.appendChild(overlay);
}

function resetGame() {
  draftPool = [];
  playerDeck = [];
  cpuDeck = [];
  playerIndex = 0;
  cpuIndex = 0;
  isGameOver = false;
  isMultiplayer = false;
  document.getElementById("deck").style.display = "flex";
  document.getElementById("result").textContent = "";
  document.getElementById("reset-btn").style.display = "none";
  document.getElementById("battlefield").style.display = "none";
  document.getElementById("start-btns").style.display = "flex";
}

window.onload = () => {
  if (!window.cards || !Array.isArray(cards)) {
    alert("❌ Gagal memuat kartu! Pastikan data.js dimuat sebelum script.js");
    return;
  }
  setupModeButtons();
};
