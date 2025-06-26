// ✅ FINAL script.js dengan Mode Multiplayer dan Lawan Bot Fix UI dan Interaksi Tombol

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
let gameMode = null;

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

function initButtons() {
  const btnBot = document.getElementById("play-bot");
  const btnMultiplayer = document.getElementById("play-multiplayer");
  const btnStart = document.getElementById("start-btn");

  btnBot.addEventListener("click", () => {
    gameMode = "bot";
    document.getElementById("result").textContent = "🤖 Mode: Lawan Bot";
    btnStart.style.display = "inline-block";
  });

  btnMultiplayer.addEventListener("click", () => {
    gameMode = "multiplayer";
    document.getElementById("result").textContent = "🎮 Mode: Multiplayer";
    btnStart.style.display = "inline-block";
  });

  btnStart.addEventListener("click", () => {
    btnStart.style.display = "none";
    if (gameMode === "bot") {
      isMultiplayer = false;
      startDraft();
    } else {
      connectMultiplayer();
    }
  });
}

function connectMultiplayer() {
  document.getElementById("result").textContent = "🔌 Menghubungkan ke server...";
  socket = io("https://sepuh-tcg-server.glitch.me");

  socket.on("connect", () => {
    console.log("Terkoneksi ke server:", socket.id);
    socket.emit("join_game");
    multiplayerTimeout = setTimeout(() => {
      console.log("⏳ Tidak ada lawan, main vs Bot.");
      document.getElementById("result").textContent = "🤖 Tidak ada lawan, bermain melawan Bot.";
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
    isMultiplayer = true;
    opponentSocketId = players.find((id) => id !== socket.id);
    startDraft();
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
    if (isDrafting && isPlayerTurn) {
      cardDiv.addEventListener("click", () => pickCard(index, cardDiv));
    }
    deckContainer.appendChild(cardDiv);
  });
  updateDraftStatus();
}

function pickCard(index, cardDiv) {
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
    } else {
      if (!isMultiplayer) {
        const randomTalk = botComments[Math.floor(Math.random() * botComments.length)];
        showBotComment(randomTalk);
      }
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
  document.getElementById("start-btn").style.display = "none";
  document.getElementById("mode-buttons").style.display = "block";
}

window.addEventListener("DOMContentLoaded", initButtons);
