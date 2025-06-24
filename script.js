function drawRandomCard() {
  const index = Math.floor(Math.random() * cards.length);
  return cards[index];
}

function renderCard(card, targetId) {
  const target = document.getElementById(targetId);
  target.innerHTML = `
    <img src="${card.image}" alt="${card.name}" />
    <h3>${card.name}</h3>
    <p>${card.description}</p>
    <p><strong>ATK:</strong> ${card.attack} | <strong>HP:</strong> ${card.hp}</p>
  `;

  // Restart animation
  target.classList.remove("card");
  void target.offsetWidth; // trigger reflow
  target.classList.add("card");
}

function playGame() {
  const player = drawRandomCard();
  const cpu = drawRandomCard();

  renderCard(player, "player-card");
  renderCard(cpu, "cpu-card");

  const playerScore = player.attack + player.hp;
  const cpuScore = cpu.attack + cpu.hp;

  const resultBox = document.getElementById("result");
  resultBox.className = "";

  if (playerScore > cpuScore) {
    resultBox.textContent = "🏆 Kamu Menang!";
    resultBox.classList.add("win");
  } else if (playerScore < cpuScore) {
    resultBox.textContent = "💀 Kamu Kalah!";
    resultBox.classList.add("lose");
  } else {
    resultBox.textContent = "⚔️ Seri!";
    resultBox.classList.add("draw");
  }
}
