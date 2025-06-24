let allCards = [];
let playerDeck = [];
let cpuDeck = [];
let selectedCards = [];
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

function drawRandomDeck(count) {
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
    <p><strong>ATK:</strong> ${card.attack} | <strong>HP:</strong> ${hp}</p>
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
  showCardSelection();
}

function showCardSelection() {
  const deckContainer = document.getElementById("deck");
  deckContainer.innerHTML = "";
  allCards = drawRandomDeck(5);
  selectedCards = [];

  allCards.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.innerHTML = `
      <img src="${card.image}" alt="${card.name}" />
      <h3>${card.name}</h3>
      <p><strong>ATK:</strong> ${card.attack} | <strong>HP:</strong> ${card.hp}</p>
    `;

    cardDiv.onclick = () => {
      if (selectedCards.includes(card)) {
        selectedCards = selectedCards.filter(c => c !== card);
        cardDiv.style.border = "";
      } else {
        if (selectedCards.length >= 3) {
          alert("Kamu hanya bisa memilih 3 kartu!");
          return;
        }
        selectedCards.push(card);
        cardDiv.style.border = "3px solid lime";
      }

      document.getElementById("confirm-deck-btn").style.display = (selectedCards.length === 3) ? "inline-block" : "none";
    };

    deckContainer.appendChild(cardDiv);
  });
}

function confirmDeck() {
  playerDeck = selectedCards;
  cpuDeck = drawRandomDeck(3);
  playerIndex = 0;
  cpuIndex = 0;
  document.getElementById("deck").style.display = "none";
  document.getElementById("confirm-deck-btn").style.display = "none";
  document.getElementById("battlefield").style.display = "flex";
  document.getElementById("result").textContent = "";
  startSurvivalDuel();
}

function startSurvivalDuel() {
  playerHP = playerDeck[playerIndex].hp;
  cpuHP = cpuDeck[cpuIndex].hp;
  renderCard(playerDeck[playerIndex], "player-card", playerHP);
  renderCard(cpuDeck[cpuIndex], "cpu-card", cpuHP);
  isBattling = true;
  setTimeout(() => duelTurn(), 1000);
}

function duelTurn() {
  if (!isBattling) return;

  // Player attack
  cpuHP = Math.max(0, cpuHP - playerDeck[playerIndex].attack);
  updateHPBar("cpu-card", cpuHP);

  if (cpuHP <= 0) {
    cpuIndex++;
    if (cpuIndex >= cpuDeck.length) {
      declareVictory("player");
      return;
    }
    cpuHP = cpuDeck[cpuIndex].hp;
    renderCard(cpuDeck[cpuIndex], "cpu-card", cpuHP);
  }

  setTimeout(() => {
    // CPU attack
    playerHP = Math.max(0, playerHP - cpuDeck[cpuIndex].attack);
    updateHPBar("player-card", playerHP);

    if (playerHP <= 0) {
      playerIndex++;
      if (playerIndex >= playerDeck.length) {
        declareVictory("cpu");
        return;
      }
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
  playerDeck = [];
  cpuDeck = [];
  playerIndex = 0;
  cpuIndex = 0;
  document.getElementById("deck").style.display = "flex";
  document.getElementById("result").textContent = "";
  document.getElementById("reset-btn").style.display = "none";
  document.getElementById("battlefield").style.display = "none";
  document.getElementById("confirm-deck-btn").style.display = "none";
  showCardSelection();
}