let playerDeck = [];
let cpuDeck = [];
let round = 1;
let maxRounds = 3;
let playerScore = 0;
let cpuScore = 0;

let playerHP = 0;
let cpuHP = 0;
let playerCardCurrent = null;
let cpuCardCurrent = null;
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
      <div class="hp-bar ${hpClass}" style="width: ${hpPercent}%;" id="${targetId}-hpbar"></div>
    </div>
  `;
}

function startGame() {
  const music = document.getElementById("bg-music");
  music.volume = 0.2;
  music.play().catch(() => alert("Klik dibutuhkan untuk memutar musik."));

  document.getElementById("start-btn").style.display = "none";
  resetGame();
}

function createDeck() {
  const deckContainer = document.getElementById("deck");
  deckContainer.innerHTML = "";
  playerDeck = drawRandomDeck(3);
  cpuDeck = drawRandomDeck(3);

  playerDeck.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.innerHTML = `
      <img src="${card.image}" alt="${card.name}" />
      <h3>${card.name}</h3>
      <p><strong>ATK:</strong> ${card.attack} | <strong>HP:</strong> ${card.hp}</p>
    `;
    cardDiv.onclick = () => {
      playSound("click-sound");
      document.getElementById("deck").style.display = "none";
      startDuel(card, cpuDeck[round - 1]);
    };
    deckContainer.appendChild(cardDiv);
  });
}

function startDuel(playerCard, cpuCard) {
  isBattling = true;
  playerCardCurrent = playerCard;
  cpuCardCurrent = cpuCard;
  playerHP = playerCard.hp;
  cpuHP = cpuCard.hp;

  renderCard(playerCard, "player-card", playerHP);
  renderCard(cpuCard, "cpu-card", cpuHP);
  document.getElementById("battlefield").style.display = "flex";
  document.getElementById("round-info").textContent = `Ronde: ${round} / ${maxRounds}`;
  document.getElementById("result").textContent = "";

  setTimeout(() => duelTurn(), 1000);
}

function duelTurn() {
  if (!isBattling) return;

  // Player menyerang bot
  cpuHP = Math.max(0, cpuHP - playerCardCurrent.attack);
  updateHPBar("cpu-card", cpuHP);
  if (cpuHP <= 0) {
    endDuel("player");
    return;
  }

  // Delay lalu bot menyerang player
  setTimeout(() => {
    playerHP = Math.max(0, playerHP - cpuCardCurrent.attack);
    updateHPBar("player-card", playerHP);

    if (playerHP <= 0) {
      endDuel("cpu");
    } else {
      // Lanjut giliran berikutnya
      setTimeout(() => duelTurn(), 800);
    }
  }, 800);
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

function endDuel(winner) {
  isBattling = false;
  const resultBox = document.getElementById("result");
  resultBox.className = "";

  if (winner === "player") {
    resultBox.textContent = "🏆 Kamu Menang Ronde Ini!";
    resultBox.classList.add("win");
    playSound("win-sound");
    playerScore++;
  } else {
    resultBox.textContent = "💀 Kamu Kalah Ronde Ini!";
    resultBox.classList.add("lose");
    playSound("lose-sound");
    cpuScore++;
  }

  if (round < maxRounds) {
    document.getElementById("next-btn").style.display = "inline-block";
  } else {
    showFinalScore();
  }
}

function nextRound() {
  round++;
  document.getElementById("deck").style.display = "flex";
  document.getElementById("result").textContent = "";
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("battlefield").style.display = "none";
  createDeck();
}

function resetGame() {
  round = 1;
  playerScore = 0;
  cpuScore = 0;
  document.getElementById("deck").style.display = "flex";
  document.getElementById("result").textContent = "";
  document.getElementById("reset-btn").style.display = "none";
  document.getElementById("final-score").style.display = "none";
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("round-info").textContent = `Ronde: 1 / ${maxRounds}`;
  createDeck();
}

function showFinalScore() {
  const scoreText = `🏁 Skor Akhir: ${playerScore} - ${cpuScore}`;
  const finalText = (playerScore > cpuScore) ? "🏆 Kamu Menang!" :
                    (playerScore < cpuScore) ? "💀 Kamu Kalah!" :
                    "⚔️ Imbang!";
  document.getElementById("final-score").textContent = `${scoreText} → ${finalText}`;
  document.getElementById("final-score").style.display = "block";
  document.getElementById("reset-btn").style.display = "inline-block";
}
