let playerDeck = [];
let cpuDeck = [];
let round = 1;
let maxRounds = 3;
let playerScore = 0;
let cpuScore = 0;

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

function renderCard(card, targetId) {
  const target = document.getElementById(targetId);
  target.innerHTML = `
    <img src="${card.image}" alt="${card.name}" />
    <h3>${card.name}</h3>
    <p>${card.description}</p>
    <p><strong>ATK:</strong> ${card.attack} | <strong>HP:</strong> ${card.hp}</p>
  `;
}

function startGame() {
  const music = document.getElementById("bg-music");
  music.volume = 0.2;
  music.play().catch(() => {
    alert("Klik dibutuhkan untuk memutar musik.");
  });

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
      battle(card, cpuDeck[round - 1]);
    };
    deckContainer.appendChild(cardDiv);
  });
}

function battle(playerCard, cpuCard) {
  renderCard(playerCard, "player-card");
  renderCard(cpuCard, "cpu-card");

  const playerScoreThisRound = playerCard.attack + playerCard.hp;
  const cpuScoreThisRound = cpuCard.attack + cpuCard.hp;

  const resultBox = document.getElementById("result");
  resultBox.className = "";

  if (playerScoreThisRound > cpuScoreThisRound) {
    resultBox.textContent = "🏆 Kamu Menang Ronde Ini!";
    resultBox.classList.add("win");
    playSound("win-sound");
    playerScore++;
  } else if (playerScoreThisRound < cpuScoreThisRound) {
    resultBox.textContent = "💀 Kamu Kalah Ronde Ini!";
    resultBox.classList.add("lose");
    playSound("lose-sound");
    cpuScore++;
  } else {
    resultBox.textContent = "⚔️ Seri!";
    resultBox.classList.add("draw");
    playSound("draw-sound");
  }

  document.getElementById("round-info").textContent = `Ronde: ${round} / ${maxRounds}`;
  document.getElementById("battlefield").style.display = "flex";

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
  createDeck(); // pilih ulang kartu untuk ronde berikutnya
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
