function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

function drawBotCard() {
  return cards[Math.floor(Math.random() * cards.length)];
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

function battle(player, cpu) {
  renderCard(player, "player-card");
  renderCard(cpu, "cpu-card");

  const playerScore = player.attack + player.hp;
  const cpuScore = cpu.attack + cpu.hp;
  const resultBox = document.getElementById("result");
  resultBox.className = "";

  if (playerScore > cpuScore) {
    resultBox.textContent = "🏆 Kamu Menang!";
    resultBox.classList.add("win");
    playSound("win-sound");
  } else if (playerScore < cpuScore) {
    resultBox.textContent = "💀 Kamu Kalah!";
    resultBox.classList.add("lose");
    playSound("lose-sound");
  } else {
    resultBox.textContent = "⚔️ Seri!";
    resultBox.classList.add("draw");
    playSound("draw-sound");
  }

  document.getElementById("battlefield").style.display = "flex";
  document.getElementById("reset-btn").style.display = "inline-block";
}

function createDeck() {
  const deckContainer = document.getElementById("deck");
  deckContainer.innerHTML = "";

  const deckOptions = [...cards].sort(() => 0.5 - Math.random()).slice(0, 3);
  deckOptions.forEach(card => {
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
      battle(card, drawBotCard());
    };
    deckContainer.appendChild(cardDiv);
  });
}

function resetGame() {
  document.getElementById("battlefield").style.display = "none";
  document.getElementById("result").textContent = "";
  document.getElementById("reset-btn").style.display = "none";
  document.getElementById("deck").style.display = "flex";
  createDeck();
}

function startGame() {
  const music = document.getElementById("bg-music");
  music.volume = 0.2;
  music.play().catch(() => {
    alert("Klik dibutuhkan untuk memutar musik.");
  });

  document.getElementById("start-btn").style.display = "none";
  createDeck();
}
