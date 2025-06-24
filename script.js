// ✅ FINAL script.js untuk Sepuh TCG
// Fitur lengkap: Draft 3/10, Survival Duel, HP Bar, Audio, Preview, Animasi

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

function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
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

function startGame() {
  const music = document.getElementById("bg-music");
  music.volume = 0.2;
  music.play().catch(() => alert("Klik dibutuhkan untuk memutar musik."));

  document.getElementById("start-btn").style.display = "none";
  startDraft();
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

    if (isDrafting && isPlayerTurn) {
      cardDiv.onclick = () => {
        animateCardToDeck(cardDiv, 'player');
        pickCard(index, 'player');
      };
    }

    deckContainer.appendChild(cardDiv);
  });

  updateDraftStatus();
}

function pickCard(index, who) {
  const chosen = draftPool.splice(index, 1)[0];
  if (who === 'player') playerDeck.push(chosen);
  else cpuDeck.push(chosen);

  updateDraftDeckSlots();

  if (playerDeck.length + cpuDeck.length < 6) {
    isPlayerTurn = !isPlayerTurn;
    if (!isPlayerTurn) setTimeout(() => {
      const randIndex = Math.floor(Math.random() * draftPool.length);
      animateCardToDeck(document.querySelectorAll(".card")[randIndex], 'cpu');
      pickCard(randIndex, 'cpu');
    }, 500);
  } else {
    isDrafting = false;
    showAllTeams();
    setTimeout(() => {
      document.getElementById("deck").style.display = "none";
      document.getElementById("battlefield").style.display = "flex";
      startSurvivalDuel();
    }, 2000);
  }
}

function updateDraftStatus() {
  const resultBox = document.getElementById("result");
  if (isDrafting) {
    resultBox.textContent = isPlayerTurn ? "🧍 Giliran Kamu Memilih Kartu" : "🤖 Bot sedang memilih...";
  } else {
    resultBox.textContent = "";
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
  const targetIndex = owner === 'player' ? playerDeck.length : cpuDeck.length;
  const targetSlot = document.getElementById(`${owner === 'player' ? 'p' : 'c'}-slot-${targetIndex}`);

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
    updateDraftDeckSlots();
  }, 700);
}

function showAllTeams() {
  const display = document.createElement("div");
  display.innerHTML = "<h3>🧍 Kartu Kamu & 🤖 Kartu Bot</h3>";
  display.style.display = "flex";
  display.style.justifyContent = "center";
  display.style.gap = "3rem";

  const playerRow = document.createElement("div");
  playerRow.innerHTML = "<strong>🧍 Kamu:</strong><br/>";
  playerDeck.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${card.image}" alt="${card.name}" title="${card.name}" style="width: 80px" />`;
    playerRow.appendChild(div);
  });

  const cpuRow = document.createElement("div");
  cpuRow.innerHTML = "<strong>🤖 Bot:</strong><br/>";
  cpuDeck.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${card.image}" alt="${card.name}" title="${card.name}" style="width: 80px" />`;
    cpuRow.appendChild(div);
  });

  display.appendChild(playerRow);
  display.appendChild(cpuRow);
  document.body.insertBefore(display, document.getElementById("battlefield"));
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
  if (cpuHP <= 0) {
    cpuIndex++;
    if (cpuIndex >= cpuDeck.length) return declareVictory("player");
    cpuHP = cpuDeck[cpuIndex].hp;
    renderCard(cpuDeck[cpuIndex], "cpu-card", cpuHP);
  }

  setTimeout(() => {
    playerHP = Math.max(0, playerHP - cpuDeck[cpuIndex].attack);
    updateHPBar("player-card", playerHP);
    if (playerHP <= 0) {
      playerIndex++;
      if (playerIndex >= playerDeck.length) return declareVictory("cpu");
      playerHP = playerDeck[playerIndex].hp;
      renderCard(playerDeck[playerIndex], "player-card", playerHP);
    }
    setTimeout(() => duelTurn(), 800);
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
  } else {
    resultBox.textContent = "💀 Kamu Kalah!";
    resultBox.classList.add("lose");
    playSound("lose-sound");
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
  document.getElementById("deck").style.display = "flex";
  document.getElementById("result").textContent = "";
  document.getElementById("reset-btn").style.display = "none";
  document.getElementById("battlefield").style.display = "none";
  const overlay = document.getElementById("card-preview-overlay");
  if (overlay) overlay.remove();
  startDraft();
}
