let draftPool = [];
let playerDeck = [];
let cpuDeck = [];
let isPlayerTurn = true;
let isDrafting = true;
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
}

function renderDraftPool() {
  const deckContainer = document.getElementById("deck");
  deckContainer.innerHTML = "";

  draftPool.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.innerHTML = `
      <img src="${card.image}" alt="${card.name}" />
      <h3>${card.name}</h3>
      <p><strong>ATK:</strong> ${card.attack} | <strong>HP:</strong> ${card.hp}</p>
    `;

    if (isDrafting && isPlayerTurn) {
      cardDiv.onclick = () => {
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

  if (playerDeck.length + cpuDeck.length < 6) {
    isPlayerTurn = !isPlayerTurn;
    if (!isPlayerTurn) setTimeout(cpuPick, 500);
  } else {
    isDrafting = false;
    showSelectedCards();
    setTimeout(() => {
      document.getElementById("deck").style.display = "none";
      document.getElementById("battlefield").style.display = "flex";
      startSurvivalDuel();
    }, 1500);
  }

  renderDraftPool();
}

function cpuPick() {
  const index = Math.floor(Math.random() * draftPool.length);
  pickCard(index, 'cpu');
}

function updateDraftStatus() {
  const resultBox = document.getElementById("result");
  if (isDrafting) {
    resultBox.textContent = isPlayerTurn ? "🧍 Giliran Kamu Memilih Kartu" : "🤖 Bot sedang memilih...";
  } else {
    resultBox.textContent = "";
  }
}

function showSelectedCards() {
  const deck = document.getElementById("deck");
  deck.innerHTML = "<h3>🧍 Kartu Kamu</h3>";
  playerDeck.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${card.image}" /><h3>${card.name}</h3>`;
    deck.appendChild(div);
  });

  const botTitle = document.createElement("h3");
  botTitle.innerText = "🤖 Kartu Bot";
  deck.appendChild(botTitle);

  cpuDeck.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${card.image}" /><h3>${card.name}</h3>`;
    deck.appendChild(div);
  });
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
}

function resetGame() {
  draftPool = [];
  playerDeck = [];
  cpuDeck = [];
  playerIndex = 0;
  cpuIndex = 0;
  document.getElementById("deck").style.display = "flex";
  document.getElementById("result").textContent = "";
  document.getElementById("reset-btn").style.display = "none";
  document.getElementById("battlefield").style.display = "none";
  startDraft();
}