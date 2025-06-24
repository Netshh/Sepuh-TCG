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
}

function playGame() {
  const player = drawRandomCard();
  const cpu = drawRandomCard();

  renderCard(player, "player-card");
  renderCard(cpu, "cpu-card");

  let resultText = "";
  if (player.attack > cpu.attack) {
    resultText = "🏆 Kamu Menang!";
  } else if (player.attack < cpu.attack) {
    resultText = "💀 Kamu Kalah!";
  } else {
    resultText = "⚔️ Seri!";
  }

  document.getElementById("result").textContent = resultText;
}
