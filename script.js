// ✅ FINAL script.js dengan Multiplayer & Bot Mode, Card Preview, dan Fix Socket Scope

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
let socket = null;
let opponentSocketId = null;
let multiplayerTimeout = null;
let isWaitingForOpponent = false;

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

function setupModeButtons() {
  const botBtn = document.getElementById("btn-vs-bot");
  const multiBtn = document.getElementById("btn-multiplayer");

  if (botBtn) {
    botBtn.onclick = () => {
      isMultiplayer = false;
      startGame();
    };
  }

  if (multiBtn) {
    multiBtn.onclick = () => {
      isMultiplayer = true;
      startMultiplayer();
    };
  }
}

window.onload = () => {
  setupModeButtons();
};

function startGame() {
  const loader = document.getElementById("loader-overlay");
  loader.style.display = "flex";
  const music = document.getElementById("bg-music");
  const allImages = cards.map(c => c.image);

  preloadImagesWithProgress(allImages, () => {
    loader.style.display = "none";
    music.volume = 0.2;
    music.play().catch(() => alert("Klik dibutuhkan untuk memutar musik."));
    document.getElementById("start-btns").style.display = "none";
    startDraft();
  });
}

function startMultiplayer() {
  const loader = document.getElementById("loader-overlay");
  loader.style.display = "flex";
  const music = document.getElementById("bg-music");
  const allImages = cards.map(c => c.image);

  preloadImagesWithProgress(allImages, () => {
    loader.style.display = "none";
    music.volume = 0.2;
    music.play().catch(() => alert("Klik dibutuhkan untuk memutar musik."));
    document.getElementById("start-btns").style.display = "none";

    socket = io("https://sepuh-tcg-server.glitch.me");
    document.getElementById("result").textContent = "🔌 Menghubungkan ke server...";

    socket.on("connect", () => {
      console.log("🔌 Terkoneksi ke server:", socket.id);
      socket.emit("join_game");

      multiplayerTimeout = setTimeout(() => {
        document.getElementById("result").textContent = "🤖 Tidak ada lawan, silakan coba lagi.";
        document.getElementById("start-btns").style.display = "flex";
        setupModeButtons();
      }, 10000);
    });

    socket.on("waiting", (msg) => {
      document.getElementById("result").textContent = "🕒 " + msg;
    });

    socket.on("match_found", ({ room, players }) => {
      clearTimeout(multiplayerTimeout);
      console.log("🎮 Match found - Room:", room, "Players:", players);
      document.getElementById("result").textContent = "🎮 Lawan ditemukan! (Mode: UI Multiplayer + Bot Logic)";
      opponentSocketId = players.find((id) => id !== socket.id);
      console.log("👤 Opponent ID:", opponentSocketId);
      
      // Gunakan mode bot dengan UI multiplayer
      console.log("🎮 Mode multiplayer dengan UI multiplayer, menggunakan logika bot");
      startMultiplayerDraft();
    });

    // Event untuk menerima pilihan kartu lawan
    socket.on("opponent_card_choice", (data) => {
      console.log("📥 Event opponent_card_choice diterima:", data);
      if (isMultiplayer && isDrafting && !isPlayerTurn) {
        console.log("✅ Kondisi terpenuhi, memproses pilihan lawan");
        handleOpponentCardChoice(data);
      } else {
        console.log("❌ Kondisi tidak terpenuhi - isMultiplayer:", isMultiplayer, "isDrafting:", isDrafting, "!isPlayerTurn:", !isPlayerTurn);
      }
    });

    // Fallback: jika event tidak ada, gunakan mode bot dengan multiplayer UI
    socket.on("disconnect", () => {
      console.log("❌ Terputus dari server");
      if (isMultiplayer) {
        document.getElementById("result").textContent = "❌ Koneksi terputus, menggunakan mode bot";
        isMultiplayer = false;
      }
    });
  });
}

// Loader overlay hide after load
window.addEventListener("load", () => {
  const loader = document.getElementById("loader-overlay");
  if (loader) loader.style.display = "none";
});

function preloadImagesWithProgress(imageUrls, callback) {
  let loaded = 0;
  const total = imageUrls.length;
  const bar = document.getElementById("loader-bar");
  const percent = document.getElementById("loader-percent");

  const slowWarningTimeout = setTimeout(() => {
    const spinner = document.getElementById("loader-spinner");
    if (spinner) spinner.style.display = "flex";
  }, 5000); // tampilkan warning jika loading lebih dari 5 detik

  if (total === 0) {
    clearTimeout(slowWarningTimeout);
    return callback();
  }

  function updateProgress() {
    const progress = Math.floor((loaded / total) * 100);
    if (bar) bar.style.width = `${progress}%`;
    if (percent) percent.textContent = `${progress}%`;
  }

  imageUrls.forEach((url) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      loaded++;
      updateProgress();
      if (loaded === total) {
        clearTimeout(slowWarningTimeout);
        callback();
      }
    }, 7000); // fallback tetap ada

    img.onload = img.onerror = () => {
      clearTimeout(timeout);
      loaded++;
      updateProgress();
      if (loaded === total) {
        clearTimeout(slowWarningTimeout);
        callback();
      }
    };
    img.src = url;
  });
}

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

function drawDraftPool(count) {
  return [...cards].sort(() => 0.5 - Math.random()).slice(0, count);
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

function startDraft() {
  draftPool = drawDraftPool(10);
  playerDeck = [];
  cpuDeck = [];
  isDrafting = true;
  isPlayerTurn = true;
  renderDraftPool();
  updateDraftDeckSlots();
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
    if (isDrafting) {
      cardDiv.addEventListener("click", () => onCardClick(index, cardDiv));
    }
    deckContainer.appendChild(cardDiv);
  });

  updateDraftStatus();
}

function onCardClick(index, cardDiv) {
  if (!isPlayerTurn || !isDrafting) return;
  
  console.log("🎯 Pemain memilih kartu:", index);
  
  isPlayerTurn = false;
  const chosen = draftPool.splice(index, 1)[0];
  playerDeck.push(chosen);
  animateCardToDeck(cardDiv, 'player');
  renderDraftPool();
  
  if (isMultiplayer) {
    // Mode multiplayer - kirim pilihan ke lawan dan tunggu respons
    isWaitingForOpponent = true;
    updateMultiplayerDraftDeckSlots();
    updateDraftStatus();
    
    console.log("📤 Mengirim pilihan kartu ke lawan:", chosen.name);
    
    // Kirim pilihan kartu ke lawan
    if (socket && socket.connected) {
      const cardChoiceData = {
        cardIndex: index,
        card: chosen,
        playerId: socket.id
      };
      console.log("📤 Mengirim data ke server:", cardChoiceData);
      socket.emit("card_choice", cardChoiceData);
    } else {
      console.log("❌ Socket tidak terhubung, tidak bisa mengirim pilihan");
    }
    
    // Fallback: jika tidak ada respons dari lawan dalam 15 detik, gunakan mode bot
    const fallbackTimeout = setTimeout(() => {
      if (isWaitingForOpponent && isMultiplayer && isDrafting) {
        console.log("⚠️ Tidak ada respons dari lawan dalam 15 detik, menggunakan mode bot");
        handleBotChoice();
      }
    }, 15000);
    
    // Tambahkan event listener untuk menerima pilihan lawan
    socket.on("opponent_card_choice", (data) => {
      if (isMultiplayer && isDrafting && !isPlayerTurn) {
        console.log("📥 Menerima pilihan dari lawan:", data);
        clearTimeout(fallbackTimeout);
        handleOpponentCardChoice(data);
      }
    });
    
  } else {
    // Mode bot
    updateDraftDeckSlots();
    handleBotChoice();
  }
}

function handleOpponentCardChoice(data) {
  const { cardIndex, card, playerId } = data;
  
  console.log("🔄 Memproses pilihan lawan:", card.name);
  
  // Pastikan ini adalah pilihan dari lawan, bukan dari diri sendiri
  if (playerId === socket.id) {
    console.log("❌ Mengabaikan pilihan dari diri sendiri");
    return;
  }
  
  // Hapus kartu dari pool yang tersisa
  if (draftPool.length > 0) {
    const remainingCardIndex = draftPool.findIndex(c => c.name === card.name);
    if (remainingCardIndex !== -1) {
      draftPool.splice(remainingCardIndex, 1);
      console.log("🗑️ Menghapus kartu dari pool:", card.name);
    }
  }
  
  cpuDeck.push(card);
  renderDraftPool();
  updateMultiplayerDraftDeckSlots();
  
  console.log("📊 Status draft - Player:", playerDeck.length, "Opponent:", cpuDeck.length);
  
  // Cek apakah draft selesai
  if (playerDeck.length + cpuDeck.length >= 6) {
    // Draft selesai, mulai pertarungan
    console.log("🏁 Draft selesai, memulai pertarungan");
    isDrafting = false;
    updateDraftStatus();
    showAllTeams();
    setTimeout(() => {
      document.getElementById("deck").style.display = "none";
      document.getElementById("battlefield").style.display = "flex";
      startSurvivalDuel(); // Gunakan logika bot untuk pertarungan
    }, 2000);
  } else {
    // Lanjut ke ronde berikutnya
    console.log("🔄 Lanjut ke ronde berikutnya");
    isPlayerTurn = true;
    isWaitingForOpponent = false;
    updateDraftStatus();
  }
}

function handleBotChoice() {
  setTimeout(() => {
    const randIndex = Math.floor(Math.random() * draftPool.length);
    const botCard = document.querySelectorAll(".card")[randIndex];
    const botChoice = draftPool.splice(randIndex, 1)[0];
    cpuDeck.push(botChoice);
    animateCardToDeck(botCard, isMultiplayer ? 'opponent' : 'cpu');
    renderDraftPool();
    if (isMultiplayer) {
      updateMultiplayerDraftDeckSlots();
    } else {
      updateDraftDeckSlots();
    }

    if (playerDeck.length + cpuDeck.length < 6) {
      isPlayerTurn = true;
      isWaitingForOpponent = false;
      updateDraftStatus();
    } else {
      isDrafting = false;
      updateDraftStatus();
      showAllTeams();
      setTimeout(() => {
        document.getElementById("deck").style.display = "none";
        document.getElementById("battlefield").style.display = "flex";
        if (isMultiplayer) {
          startMultiplayerBattle();
        } else {
          startSurvivalDuel();
        }
      }, 2000);
    }
  }, 600);
}

function updateDraftStatus() {
  const resultBox = document.getElementById("result");
  const turnIndicator = document.getElementById("turn-indicator");
  
  console.log("🔄 Update draft status - isDrafting:", isDrafting, "isPlayerTurn:", isPlayerTurn, "isWaitingForOpponent:", isWaitingForOpponent, "isMultiplayer:", isMultiplayer);
  
  if (isDrafting) {
    if (isMultiplayer) {
      if (isWaitingForOpponent) {
        resultBox.textContent = "⏳ MENUNGGU LAWAN MEMILIH KARTU... (Giliran Lawan)";
        resultBox.style.color = "#ff6b6b";
        resultBox.style.fontWeight = "bold";
        
        // Update turn indicator dengan animasi
        if (turnIndicator) {
          turnIndicator.textContent = "⏳ ENEMY TURN - Menunggu lawan memilih kartu...";
          turnIndicator.style.background = "#ff6b6b";
          turnIndicator.style.color = "white";
          turnIndicator.style.animation = "pulse 2s infinite";
          console.log("🎯 Turn indicator: ENEMY TURN");
        }
      } else {
        if (isPlayerTurn) {
          resultBox.textContent = "🎯 GILIRAN KAMU MEMILIH KARTU! (Your Turn)";
          resultBox.style.color = "#51cf66";
          resultBox.style.fontWeight = "bold";
          
          // Update turn indicator dengan animasi
          if (turnIndicator) {
            turnIndicator.textContent = "🎯 YOUR TURN - Pilih kartu sekarang!";
            turnIndicator.style.background = "#51cf66";
            turnIndicator.style.color = "white";
            turnIndicator.style.animation = "glow 1.5s ease-in-out infinite alternate";
            console.log("🎯 Turn indicator: YOUR TURN");
          }
        } else {
          resultBox.textContent = "⏳ LAWAN SEDANG MEMILIH KARTU... (Enemy Turn)";
          resultBox.style.color = "#ff6b6b";
          resultBox.style.fontWeight = "bold";
          
          // Update turn indicator dengan animasi
          if (turnIndicator) {
            turnIndicator.textContent = "⏳ ENEMY TURN - Lawan sedang memilih kartu...";
            turnIndicator.style.background = "#ff6b6b";
            turnIndicator.style.color = "white";
            turnIndicator.style.animation = "pulse 2s infinite";
            console.log("🎯 Turn indicator: ENEMY TURN");
          }
        }
      }
    } else {
      if (isPlayerTurn) {
        resultBox.textContent = "🎯 GILIRAN KAMU MEMILIH KARTU! (Your Turn)";
        resultBox.style.color = "#51cf66";
        resultBox.style.fontWeight = "bold";
        
        // Update turn indicator dengan animasi
        if (turnIndicator) {
          turnIndicator.textContent = "🎯 YOUR TURN - Pilih kartu sekarang!";
          turnIndicator.style.background = "#51cf66";
          turnIndicator.style.color = "white";
          turnIndicator.style.animation = "glow 1.5s ease-in-out infinite alternate";
          console.log("🎯 Turn indicator: YOUR TURN (BOT MODE)");
        }
      } else {
        resultBox.textContent = "🤖 Bot sedang memilih...";
        resultBox.style.color = "#ff6b6b";
        resultBox.style.fontWeight = "bold";
        
        // Update turn indicator dengan animasi
        if (turnIndicator) {
          turnIndicator.textContent = "🤖 BOT TURN - Bot sedang memilih kartu...";
          turnIndicator.style.background = "#ff6b6b";
          turnIndicator.style.color = "white";
          turnIndicator.style.animation = "pulse 2s infinite";
          console.log("🎯 Turn indicator: BOT TURN");
        }
      }
    }
  } else {
    resultBox.textContent = "";
    resultBox.style.color = "";
    resultBox.style.fontWeight = "";
    
    // Clear turn indicator
    if (turnIndicator) {
      turnIndicator.textContent = "";
      turnIndicator.style.background = "";
      turnIndicator.style.color = "";
      turnIndicator.style.animation = "";
      console.log("🎯 Turn indicator: CLEARED");
    }
  }
}

function updateDraftDeckSlots() {
  const draftVisual = document.getElementById("draft-visual");
  if (!draftVisual) return;
  draftVisual.innerHTML = `
    <div class="draft-row">
      <h3>🧍 Kamu</h3>
      <div class="draft-deck" id="player-draft">
        ${[0,1,2].map(i => `<div class="deck-slot" id="p-slot-${i}">${playerDeck[i] ? `<img src="${playerDeck[i].image}" />` : ''}</div>`).join('')}
      </div>
    </div>
    <div class="draft-row">
      <h3>🤖 Bot</h3>
      <div class="draft-deck" id="cpu-draft">
        ${[0,1,2].map(i => `<div class="deck-slot" id="c-slot-${i}">${cpuDeck[i] ? `<img src="${cpuDeck[i].image}" />` : ''}</div>`).join('')}
      </div>
    </div>
  `;
}

function animateCardToDeck(cardElement, owner) {
  const clone = cardElement.cloneNode(true);
  const rect = cardElement.getBoundingClientRect();
  const targetIndex = owner === 'player' ? playerDeck.length - 1 : cpuDeck.length - 1;
  const targetSlot = document.getElementById(`${owner === 'player' ? 'p' : owner === 'opponent' ? 'o' : 'c'}-slot-${targetIndex}`);
  if (!targetSlot) return;
  const slotRect = targetSlot.getBoundingClientRect();
  clone.style.position = 'fixed';
  clone.style.top = `${rect.top}px`;
  clone.style.left = `${rect.left}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.zIndex = 10000;
  clone.classList.add("floating-card");
  document.body.appendChild(clone);
  requestAnimationFrame(() => {
    clone.style.transition = 'all 0.6s ease';
    clone.style.top = `${slotRect.top}px`;
    clone.style.left = `${slotRect.left}px`;
    clone.style.width = `${slotRect.width}px`;
  });
  setTimeout(() => {
    clone.remove();
    if (isMultiplayer) {
      updateMultiplayerDraftDeckSlots();
    } else {
      updateDraftDeckSlots();
    }
  }, 700);
}

function showAllTeams() {
  const container = document.createElement("div");
  container.className = "card-grid";
  container.innerHTML = `
    <div class="card-section">
      <div class="label">🧍 Player</div>
      ${playerDeck.map(card => `<div class="card"><img src="${card.image}" alt="${card.name}" title="${card.name}" /></div>`).join('')}
    </div>
    <div class="card-section">
      <div class="label">${isMultiplayer ? '👤 Lawan' : '🤖 Bot'}</div>
      ${cpuDeck.map(card => `<div class="card"><img src="${card.image}" alt="${card.name}" title="${card.name}" /></div>`).join('')}
    </div>
  `;
  document.body.insertBefore(container, document.getElementById("battlefield"));
}

function startSurvivalDuel() {
  playerIndex = 0;
  cpuIndex = 0;
  playerHP = playerDeck[playerIndex].hp;
  cpuHP = cpuDeck[cpuIndex].hp;
  renderCard(playerDeck[playerIndex], "player-card", playerHP);
  renderCard(cpuDeck[cpuIndex], "cpu-card", cpuHP);
  isBattling = true;
  setTimeout(() => duelTurn(), 1000);
}

function duelTurn() {
  if (!isBattling) return;
  cpuHP = Math.max(0, cpuHP - playerDeck[playerIndex].attack);
  updateHPBar("cpu-card", cpuHP);

  setTimeout(() => {
    if (cpuHP <= 0) {
      cpuIndex++;
      if (cpuIndex >= cpuDeck.length) return declareVictory("player");
      cpuHP = cpuDeck[cpuIndex].hp;
      renderCard(cpuDeck[cpuIndex], "cpu-card", cpuHP);
      showBotComment("Kartu berikutnya... masih ada! 😤");
    } else {
      const randomTalk = botComments[Math.floor(Math.random() * botComments.length)];
      showBotComment(randomTalk);
    }
  }, 300);

  setTimeout(() => {
    playerHP = Math.max(0, playerHP - cpuDeck[cpuIndex].attack);
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
    showBotComment("Arrghh! Abah kalah! Kamu kuat juga... 😵");
  } else {
    resultBox.textContent = "💀 Kamu Kalah!";
    resultBox.classList.add("lose");
    playSound("lose-sound");
    showBotComment("Hehe! Dasar sepuh pensiunan! 😎");
  }
  document.getElementById("reset-btn").style.display = "inline-block";
  enableCardPreview();
}

function enableCardPreview() {
  const allCardDivs = document.querySelectorAll(".card img");
  allCardDivs.forEach(img => {
    img.style.cursor = "zoom-in";
    img.onclick = () => {
      const parent = img.parentElement;
      const name = parent.querySelector("h3")?.textContent || "";
      const desc = parent.querySelector("p")?.textContent || "";
      const stats = parent.querySelectorAll("p")[1]?.textContent || "";
      showCardPreview(img.src, name, stats, desc);
    };
  });
}

function showCardPreview(image, name, stats, desc) {
  let existing = document.getElementById("card-preview-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "card-preview-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.8)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = 9999;
  const cardBox = document.createElement("div");
  cardBox.style.background = "#222";
  cardBox.style.padding = "1rem";
  cardBox.style.borderRadius = "10px";
  cardBox.style.maxWidth = "90%";
  cardBox.style.color = "#fff";
  cardBox.style.textAlign = "center";
  const img = document.createElement("img");
  img.src = image;
  img.style.maxWidth = "300px";
  img.style.borderRadius = "10px";
  const title = document.createElement("h2");
  title.textContent = name;
  const stat = document.createElement("p");
  stat.innerHTML = `<strong>${stats}</strong>`;
  const detail = document.createElement("p");
  detail.textContent = desc;
  const close = document.createElement("button");
  close.textContent = "Tutup";
  close.style.marginTop = "1rem";
  close.onclick = () => overlay.remove();
  cardBox.appendChild(img);
  cardBox.appendChild(title);
  cardBox.appendChild(stat);
  cardBox.appendChild(detail);
  cardBox.appendChild(close);
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
  isWaitingForOpponent = false;
  
  // Disconnect socket jika dalam mode multiplayer
  if (isMultiplayer && socket) {
    socket.disconnect();
    socket = null;
    opponentSocketId = null;
  }
  
  document.getElementById("deck").style.display = "flex";
  document.getElementById("result").textContent = "";
  document.getElementById("result").style.color = "";
  document.getElementById("result").style.fontWeight = "";
  document.getElementById("reset-btn").style.display = "none";
  document.getElementById("battlefield").style.display = "none";
  
  // Clear turn indicator
  const turnIndicator = document.getElementById("turn-indicator");
  if (turnIndicator) {
    turnIndicator.textContent = "";
    turnIndicator.style.background = "";
    turnIndicator.style.color = "";
    turnIndicator.style.animation = "";
  }
  
  const overlay = document.getElementById("card-preview-overlay");
  if (overlay) overlay.remove();
  const draftVisual = document.getElementById("draft-visual");
  if (draftVisual) draftVisual.innerHTML = "";
  
  // Tampilkan kembali tombol mode
  document.getElementById("start-btns").style.display = "flex";
  setupModeButtons();
  
  // Reset ke mode bot
  isMultiplayer = false;
}

function startMultiplayerDraft() {
  draftPool = drawDraftPool(10);
  playerDeck = [];
  cpuDeck = [];
  isDrafting = true;
  isPlayerTurn = true;
  isWaitingForOpponent = false;
  renderDraftPool();
  updateMultiplayerDraftDeckSlots();
  
  // Pastikan turn indicator muncul
  updateDraftStatus();
  
  console.log("🎮 Mode multiplayer dimulai - menunggu input lawan");
}

function updateMultiplayerDraftDeckSlots() {
  const draftVisual = document.getElementById("draft-visual");
  if (!draftVisual) return;
  draftVisual.innerHTML = `
    <div class="draft-row">
      <h3>🧍 Kamu</h3>
      <div class="draft-deck" id="player-draft">
        ${[0,1,2].map(i => `<div class="deck-slot" id="p-slot-${i}">${playerDeck[i] ? `<img src="${playerDeck[i].image}" />` : ''}</div>`).join('')}
      </div>
    </div>
    <div class="draft-row">
      <h3>👤 Lawan</h3>
      <div class="draft-deck" id="opponent-draft">
        ${[0,1,2].map(i => `<div class="deck-slot" id="o-slot-${i}">${cpuDeck[i] ? `<img src="${cpuDeck[i].image}" />` : ''}</div>`).join('')}
      </div>
    </div>
  `;
}

function startMultiplayerBattle() {
  // Gunakan startSurvivalDuel sebagai gantinya
  startSurvivalDuel();
}

window.onload = () => {
  setupModeButtons();
};
